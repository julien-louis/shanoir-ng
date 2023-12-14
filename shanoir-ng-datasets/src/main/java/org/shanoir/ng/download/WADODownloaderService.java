/**
 * Shanoir NG - Import, manage and share neuroimaging data
 * Copyright (C) 2009-2019 Inria - https://www.inria.fr/
 * Contact us on https://project.inria.fr/shanoir/
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/gpl-3.0.html
 */

package org.shanoir.ng.download;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.StringReader;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipException;
import java.util.zip.ZipOutputStream;

import javax.json.Json;
import javax.json.stream.JsonParser;

import org.apache.commons.lang3.StringUtils;
import org.dcm4che3.data.Attributes;
import org.dcm4che3.json.JSONReader;
import org.shanoir.ng.dataset.model.Dataset;
import org.shanoir.ng.dataset.model.DatasetExpressionFormat;
import org.shanoir.ng.dataset.service.DatasetUtils;
import org.shanoir.ng.datasetacquisition.model.DatasetAcquisition;
import org.shanoir.ng.datasetfile.DatasetFile;
import org.shanoir.ng.shared.exception.PacsException;
import org.shanoir.ng.shared.exception.RestServiceException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.ByteArrayHttpMessageConverter;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import jakarta.annotation.PostConstruct;
import jakarta.mail.BodyPart;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.util.ByteArrayDataSource;

/**
 * This class is used to download files on using WADO URLs:
 * 
 * WADO-RS URLs are supported: http://dicom.nema.org/DICOM/2013/output/chtml/part18/sect_6.5.html
 * WADO-URI URLs are supported: http://dicom.nema.org/DICOM/2013/output/chtml/part18/sect_6.2.html
 * 
 * WADO-RS: http://dcm4chee-arc:8081/dcm4chee-arc/aets/AS_RECEIVED/rs/studies/1.4.9.12.22.1.8447.5189520782175635475761938816300281982444
 * /series/1.4.9.12.22.1.3337.609981376830290333333439326036686033499
 * /instances/1.4.9.12.22.1.3327.13131999371192661094333587030092502791578
 * 
 * As the responses are encoded as multipart/related messages,
 * this class extracts as well the files contained in the response to
 * the file system.
 * 
 * WADO-URI: http://dcm4chee-arc:8081/dcm4chee-arc/aets/AS_RECEIVED/wado?requestType=WADO
 * &studyUID=1.4.9.12.22.1.8444.518952078217568647576155668816300281982444
 * &seriesUID=1.4.9.12.22.1.8444.60998137683029030014444439326036686033499
 * &objectUID=1.4.9.12.22.1.8444.1313199937119266109555587030092502791578
 * &contentType=application/dicom
 * 
 * WADO-URI Web Service Endpoint URL in dcm4chee arc light 5:
 * http[s]://<host>:<port>/dcm4chee-arc/aets/{AETitle}/wado
 *
 * This Spring service component uses the scope singleton, that is there by default,
 * as one instance should be reused for all other instances, that require usage.
 * No need to create multiple.
 * 
 * @author mkain
 *
 */
@Service
public class WADODownloaderService {

	private static final String WADO_REQUEST_TYPE_WADO_RS = "/instances/";

	private static final String WADO_REQUEST_TYPE_WADO_URI = "objectUID=";

	private static final String WADO_REQUEST_STUDY_WADO_URI = "studyUID=";

	private static final String DCM = ".dcm";

	private static final String UNDER_SCORE = "_";

	/** Mime type */
	private static final String CONTENT_TYPE_MULTIPART = "multipart/related";

	private static final String CONTENT_TYPE_DICOM = "application/dicom";

	private static final String CONTENT_TYPE_DICOM_XML = "application/dicom+xml";

	private static final String CONTENT_TYPE_DICOM_JSON = "application/json";

	private static final String CONTENT_TYPE = "&contentType";

	private static final String TXT = ".txt";

	private static final String ERROR = "0000_ERROR_";

	private static final Logger LOG = LoggerFactory.getLogger(WADODownloaderService.class);

	@Autowired
	private RestTemplate restTemplate;

	@PostConstruct
	public void initRestTemplate() {
		restTemplate.getMessageConverters().add(new ByteArrayHttpMessageConverter());
	}

	/**
	 * This method receives a list of URLs containing WADO-RS or WADO-URI urls and downloads
	 * their received dicom files to a folder named workFolder.
	 * Return the list of downloaded files
	 *
	 * @param urls
	 * @param subjectName
	 * @param dataset 
	 * @param datasetFilePath
	 * @throws IOException
	 * @throws MessagingException
	 * @return
	 * @throws RestServiceException
	 *
	 */
	public List<String> downloadDicomFilesForURLsAsZip(final List<URL> urls, final SafeZipOutputStream zipOutputStream, String subjectName, Dataset dataset, String datasetFilePath, List<SerieError> serieErrors) throws IOException, MessagingException, RestServiceException {
		int i = 0;
		List<String> files = new ArrayList<>();
		for (Iterator<URL> iterator = urls.iterator(); iterator.hasNext(); i++) {
			String url = ((URL) iterator.next()).toString();
			// handle and check at first for WADO-RS URLs by "/instances/"
			int indexInstanceUID = url.lastIndexOf(WADO_REQUEST_TYPE_WADO_RS);
			// WADO-URI link found in database
			if (indexInstanceUID <= 0) {
				// handle and check secondly for WADO-URI URLs by "objectUID="
				// instanceUID == objectUID
				indexInstanceUID = url.lastIndexOf(WADO_REQUEST_TYPE_WADO_URI);
				if (indexInstanceUID <= 0) {
					LOG.error("URL for download is neither in WADO-RS nor in WADO-URI format. URL : " + url + " - Dataset id : " + dataset.getId());
					String errorDetails = "URL for download is neither in WADO-RS nor in WADO-URI format";
					writeErrorFileInZip(zipOutputStream, subjectName, indexInstanceUID, errorDetails);
				// in case an old WADO-URI is found in the database: convert it to WADO-RS
				} else {
					url = wadoURItoWadoRS(url);
					indexInstanceUID = url.lastIndexOf(WADO_REQUEST_TYPE_WADO_RS); // calculate new index
				}
			}
			String instanceUID = url.substring(indexInstanceUID + WADO_REQUEST_TYPE_WADO_RS.length());
			// Build name
			String name = buildFileName(subjectName, dataset, datasetFilePath, instanceUID);
			// Download and zip
			try {
				String zipedFile = downloadAndWriteFileInZip(url, zipOutputStream, name);
				if (zipedFile != null) {
					files.add(zipedFile);
				}
			} catch (ZipPacsFileException e) {
				writeErrorFileInZip(zipOutputStream, name, i, e.getMessage());
				if (serieErrors != null) serieErrors.add(new SerieError(i, url, e.getMessage()));
			}
		}
		return files;
	}

	private String buildFileName(String subjectName, Dataset dataset, String datasetFilePath, String instanceUID ) {
		String serieDescription = dataset.getUpdatedMetadata().getName();
		DateTimeFormatter formatter = DateTimeFormatter.ofPattern("YYYYMMdd");
		String examDate = dataset.getDatasetAcquisition().getExamination().getExaminationDate().format(formatter);
		String name = subjectName + "_" + examDate + "_" + serieDescription + "_" + instanceUID;
		// Replace all forbidden characters.
		name = name.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");
		// add folder logic if necessary
		if (datasetFilePath != null) {
			name = datasetFilePath + File.separator + name;
		}
		return name;
	}

	private void writeErrorFileInZip(ZipOutputStream zipOutputStream, String name, int i, String details) throws IOException {
		String error = "An error occured during the download of this .DCM file, please contact a shanoir administrator if necessary.";
		if (details != null) error += " (" + details + ")";
		byte[] strToBytes = error.getBytes();
		ZipEntry entry = new ZipEntry(ERROR + i + "_" + name + TXT);
		entry.setSize(strToBytes.length);
		zipOutputStream.putNextEntry(entry);
		zipOutputStream.write(strToBytes);
		zipOutputStream.closeEntry();
	}

	/**
	 * Downloads and writes the file specified by url into zipOutputStream, using name + .DCM as filename.
	 * If the downloading fails, a text file is added instead and null is returned.
	 * @param url
	 * @param zipOutputStream
	 * @param name the filename without extension
	 * @return the added file name, null if failed
	 * @throws ZipPacsFileException
	 * @throws IOException when couldn't write into the stream
	 */
	private String downloadAndWriteFileInZip(String url, SafeZipOutputStream zipOutputStream, String name) throws ZipPacsFileException {
		byte[] responseBody = null;
		try {
			responseBody = downloadFileFromPACS(url);
			this.extractDICOMZipFromMHTMLFile(responseBody, extractInstanceUID(url),  name, zipOutputStream);
			return name + DCM;
		} catch (IOException | MessagingException e) {
			LOG.error("A dicom file could not be downloaded from the pacs:", e);
			throw new ZipPacsFileException(e);
		} catch (HttpClientErrorException e) {
			//LOG.error("A dicom file could not be downloaded from the pacs:", e);
			throw new ZipPacsFileException("received " + e.getStatusCode() + " from PACS", e);
		}
	}

	/**
	 * This method receives a list of URLs containing WADO-RS or WADO-URI urls and downloads
	 * their received dicom files to a folder named workFolder.
	 * Return the list of downloaded files
	 *
	 * @param urls
	 * @param workFolder
	 * @param subjectName
	 * @param dataset 
	 * @param serieErrors
	 * @throws IOException
	 * @throws MessagingException
	 * @return
	 *
	 */
	public List<File> downloadDicomFilesForURLs(final List<URL> urls, final File workFolder, String subjectName, Dataset dataset, List<SerieError> serieErrors) throws IOException, MessagingException {
		int i = 0;
		List<File> files = new ArrayList<>();
		for (Iterator<URL> iterator = urls.iterator(); iterator.hasNext();) {
			String url = ((URL) iterator.next()).toString();
			String instanceUID = null;
			// handle and check at first for WADO-RS URLs by "/instances/"
			int indexInstanceUID = url.lastIndexOf(WADO_REQUEST_TYPE_WADO_RS);
			if (indexInstanceUID > 0) {
				instanceUID = url.substring(indexInstanceUID + WADO_REQUEST_TYPE_WADO_RS.length());
				byte[] responseBody = downloadFileFromPACS(url);
				extractDICOMFilesFromMHTMLFile(responseBody, instanceUID, workFolder);
			} else {
				// handle and check secondly for WADO-URI URLs by "objectUID="
				// instanceUID == objectUID
				indexInstanceUID = url.lastIndexOf(WADO_REQUEST_TYPE_WADO_URI);
				if (indexInstanceUID > 0) {
					instanceUID = extractInstanceUID(url);

					String serieDescription = dataset.getUpdatedMetadata().getName();
					DateTimeFormatter formatter = DateTimeFormatter.ofPattern("YYYYMMdd");
					String examDate = dataset.getDatasetAcquisition().getExamination().getExaminationDate().format(formatter);
					String name = subjectName + "_" + examDate + "_" + serieDescription + "_" + instanceUID;

					// Replace all forbidden characters.
					name = name.replaceAll("[^a-zA-Z0-9\\.\\-]", "_");

					File extractedDicomFile = new File(workFolder.getPath() + File.separator + name + DCM);

					byte[] responseBody = null;
					try {
						responseBody = downloadFileFromPACS(url);
						extractDICOMFilesFromMHTMLFile(responseBody, instanceUID, workFolder);
					} catch (Exception e) {
						
						// Just insert an error log into the file for missing dicoms.
						File errorFile = new File(workFolder.getPath() + File.separator + ERROR + i + "_" + name + TXT);
						i++;
						errorFile.createNewFile();
						String error = "An error occured during the download of this .DCM file, please contact a shanoir administrator if necessary.";
						Path path = Paths.get(errorFile.getAbsolutePath());
						byte[] strToBytes = error.getBytes();
						Files.write(path, strToBytes);

						// LOG the error
						LOG.error("A dicom file could not be downloaded from the pacs:", e);
						
						if (serieErrors != null) serieErrors.add(new SerieError(i, url, e.getMessage()));
						continue;
					}
					try (ByteArrayInputStream bIS = new ByteArrayInputStream(responseBody)) {
						Files.copy(bIS, extractedDicomFile.toPath());
						files.add(extractedDicomFile);
					}
				} else {
					if (serieErrors != null) serieErrors.add(new SerieError(i, url, "URL for download is neither in WADO-RS nor in WADO-URI format"));
				}
			}
		}
		return files;
	}

	public String downloadDicomMetadataForURL(final URL url) throws IOException, MessagingException, RestClientException {
		if (url != null) {
			String urlStr = url.toString();
			if (urlStr.contains(WADO_REQUEST_STUDY_WADO_URI)) urlStr = wadoURItoWadoRS(urlStr);
			urlStr = urlStr.split(CONTENT_TYPE)[0].concat("/metadata");
			return downloadMetadataFromPACS(urlStr);
		} else {
			return null;
		}
	}

	public Attributes getDicomAttributesForDataset(Dataset dataset) throws PacsException {
		List<URL> urls = new ArrayList<>();
		try {
			DatasetUtils.getDatasetFilePathURLs(dataset, urls, DatasetExpressionFormat.DICOM);
			if (!urls.isEmpty()) {
				String jsonMetadataStr = downloadDicomMetadataForURL(urls.get(0));
				JsonParser parser = Json.createParser(new StringReader(jsonMetadataStr));
				Attributes dicomAttributes = new JSONReader(parser).readDataset(null);
				if (dicomAttributes != null) {
					return dicomAttributes;
				} else {
					LOG.error("Could not find dicom attributes for dataset with id: " + dataset.getId());
				}
			} else {
				LOG.error("Could not find dicom attributes for dataset with id: " + dataset.getId()
				+ " : no pacs url for this dataset");
			}
		} catch (IOException | MessagingException | RestClientException e) {
			throw new PacsException("Can not get dicom attributes for dataset " + dataset.getId(), e);
		}
		return null;
	}

	static String getFirstDatasetUrl(Dataset dataset) {
		boolean condition = dataset != null 
				&& dataset.getDatasetExpressions() != null 
				&& !dataset.getDatasetExpressions().isEmpty()
				&& dataset.getDatasetExpressions().get(0) != null 
				&& DatasetExpressionFormat.DICOM.equals(dataset.getDatasetExpressions().get(0).getDatasetExpressionFormat())
				&& dataset.getDatasetExpressions().get(0).getDatasetFiles() != null
				&& !dataset.getDatasetExpressions().get(0).getDatasetFiles().isEmpty()
				&& dataset.getDatasetExpressions().get(0).getDatasetFiles().get(0) != null;
		if (condition) {
			DatasetFile datasetFile = dataset.getDatasetExpressions().get(0).getDatasetFiles().get(0);
			return StringUtils.replace(datasetFile.getPath(), "%20", " ");
		} else {
			return null;
		}
	}

	public AcquisitionAttributes<Long> getDicomAttributesForAcquisition(DatasetAcquisition acquisition) throws PacsException {
		long ts = new Date().getTime();
		List<Dataset> datasets = new ArrayList<>();
		if (acquisition.getDatasets() != null) {
			for (Dataset dataset : acquisition.getDatasets()) {
				datasets.add(dataset);
			}
		}
		AcquisitionAttributes<Long> dAcquisitionAttributes = new AcquisitionAttributes<>();
		datasets.parallelStream().forEach(
			dataset -> {
				try {
					dAcquisitionAttributes.addDatasetAttributes(dataset.getId(), getDicomAttributesForDataset(dataset));
				} catch (PacsException e) {
					throw new RuntimeException("could not get dicom attributes from pacs", e);
				}
			}
		);
		LOG.debug("get DICOM attributes for acquisition " + acquisition.getId() + " : " + (new Date().getTime() - ts) + " ms");
		return dAcquisitionAttributes;
	}

	static String extractInstanceUID(String url) {
		boolean condition1 = url != null && url.contains("objectUID=");
		boolean condition2 = url != null && url.contains("instances/");
		if (condition1) {
			String[] split = StringUtils.splitByWholeSeparator(url, "objectUID=", 2);
			return StringUtils.split(split[1], "&", 1)[0];
		} else if (condition2) {
			String[] split = StringUtils.splitByWholeSeparator(url, "instances/", 2);
			return StringUtils.split(split[1], "/", 1)[0];
		} else return null;
	}


	static String extractInstanceUID(Dataset dataset) {
		String url = getFirstDatasetUrl(dataset);
		if (url == null) {
			return null;
		} else {
			String ret = extractInstanceUID(url);
			return ret;
		}
	}

	/**
	 * This method contacts the PACS with a WADO-RS url and does the actual download.
	 * 
	 * @param url
	 * @return
	 * @throws IOException
	 */
	private byte[] downloadFileFromPACS(final String url) throws IOException, HttpClientErrorException {
		HttpHeaders headers = new HttpHeaders();
		headers.add(HttpHeaders.ACCEPT, CONTENT_TYPE_MULTIPART + "; type=" + CONTENT_TYPE_DICOM + ";");
		HttpEntity<String> entity = new HttpEntity<>(headers);
		ResponseEntity<byte[]> response = restTemplate.exchange(url,
				HttpMethod.GET, entity, byte[].class, "1");
		if (response.getStatusCode() == HttpStatus.OK) {
			return response.getBody();
		} else {
			throw new IOException("Download did not work: wrong status code received.");
		}
	}

	private String downloadMetadataFromPACS(final String url) throws IOException {
		HttpHeaders headers = new HttpHeaders();
		headers.add(HttpHeaders.ACCEPT, CONTENT_TYPE_DICOM_JSON);
		HttpEntity<String> entity = new HttpEntity<>(headers);
		LOG.debug("Download metadata from pacs, url : " + url);
		ResponseEntity<String> response = restTemplate.exchange(url,
				HttpMethod.GET, entity,String.class, "1");
		if (response.getStatusCode() == HttpStatus.OK) {
			return response.getBody();
		} else {
			throw new IOException("Download did not work: wrong status code received.");
		}
	}

	/**
	 * This method reads in a file in format MHTML, one representation of a multipart/related response, that is given from
	 * a PACS server, that supports WADO-RS requests.
	 * 
	 * MHTML, short for MIME Encapsulation of Aggregate HTML Documents, is a web page archive format used to combine in a single document
	 * the HTML code and its companion resources that are otherwise represented by external links (such as images, Flash animations, Java applets,
	 * and audio files). The content of an MHTML file is encoded as if it were an HTML e-mail message, using the MIME type multipart/related.
	 * 
	 * @param responseBody
	 * @param instanceUID
	 * @param workFolder
	 * @throws FileNotFoundException
	 * @throws IOException
	 * @throws MessagingException
	 */
	private void extractDICOMFilesFromMHTMLFile(final byte[] responseBody, final String instanceUID, final File workFolder)
			throws IOException, MessagingException {
		try(ByteArrayInputStream bIS = new ByteArrayInputStream(responseBody)) {
			ByteArrayDataSource datasource = new ByteArrayDataSource(bIS, CONTENT_TYPE_MULTIPART);
			MimeMultipart multipart = new MimeMultipart(datasource);
			int count = multipart.getCount();
			for (int i = 0; i < count; i++) {
				BodyPart bodyPart = multipart.getBodyPart(i);
				if (bodyPart.isMimeType(CONTENT_TYPE_DICOM) || bodyPart.isMimeType(CONTENT_TYPE_DICOM_XML)) {
					File extractedDicomFile = null;
					if (count == 1) {
						extractedDicomFile = new File(workFolder.getPath() + File.separator + instanceUID + DCM);
					} else {
						extractedDicomFile = new File(workFolder.getPath() + File.separator + instanceUID + UNDER_SCORE + i + DCM);
					}
					Files.copy(bodyPart.getInputStream(), extractedDicomFile.toPath());
				} else {
					throw new IOException("Answer file from PACS contains other content-type than DICOM, stop here.");
				}
			}
		}
	}

	/**
	 * This method reads in a file in format MHTML, one representation of a multipart/related response, that is given from
	 * a PACS server, that supports WADO-RS requests.
	 *
	 * MHTML, short for MIME Encapsulation of Aggregate HTML Documents, is a web page archive format used to combine in a single document
	 * the HTML code and its companion resources that are otherwise represented by external links (such as images, Flash animations, Java applets,
	 * and audio files). The content of an MHTML file is encoded as if it were an HTML e-mail message, using the MIME type multipart/related.
	 *
	 * @param responseBody
	 * @param instanceUID
	 * @throws FileNotFoundException
	 * @throws IOException
	 * @throws MessagingException
	 */
	private void extractDICOMZipFromMHTMLFile(final byte[] responseBody, final String instanceUID, String name, SafeZipOutputStream zipOutputStream)
			throws IOException, MessagingException {
		try(ByteArrayInputStream bIS = new ByteArrayInputStream(responseBody)) {
			ByteArrayDataSource datasource = new ByteArrayDataSource(bIS, CONTENT_TYPE_MULTIPART);
			MimeMultipart multipart = new MimeMultipart(datasource);
			int count = multipart.getCount();
			if (count == 1) {
				BodyPart bodyPart = multipart.getBodyPart(0);
				if (bodyPart.isMimeType(CONTENT_TYPE_DICOM) || bodyPart.isMimeType(CONTENT_TYPE_DICOM_XML)) {
					ZipEntry entry = new ZipEntry(name + DCM);
					zipOutputStream.putNextEntry(entry);
					bodyPart.getInputStream().transferTo(zipOutputStream);
					zipOutputStream.closeEntry();
				} else {
					throw new IOException("Answer file from PACS contains other content-type than DICOM, stop here.");
				}
			} else {
				for (int i = 0; i < count; i++) {
					BodyPart bodyPart = multipart.getBodyPart(i);
					if (bodyPart.isMimeType(CONTENT_TYPE_DICOM) || bodyPart.isMimeType(CONTENT_TYPE_DICOM_XML)) {
						ZipEntry entry = new ZipEntry(name + UNDER_SCORE + i + DCM);
						zipOutputStream.putNextEntry(entry);
						bodyPart.getInputStream().transferTo(zipOutputStream);
						zipOutputStream.closeEntry();
					} else {
						throw new IOException("Answer file from PACS contains other content-type than DICOM, stop here.");
					}
				}
			}
		}
	}

	private String wadoURItoWadoRS(String url) {
		return url
				.replace("wado?requestType=WADO", "rs")
				.replace("&studyUID=", "/studies/")
				.replace("&seriesUID=", "/series/")
				.replace("&objectUID=", "/instances/")
				.replace("&contentType=application/dicom", "");
	}

}
