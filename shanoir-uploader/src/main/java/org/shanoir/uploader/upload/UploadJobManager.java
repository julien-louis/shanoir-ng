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

package org.shanoir.uploader.upload;

import java.io.File;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Marshaller;
import javax.xml.bind.Unmarshaller;

import org.apache.log4j.Logger;

/**
 * This class manages UploadJobs.
 * @author mkain
 *
 */
public class UploadJobManager {
	
	private static Logger logger = Logger.getLogger(UploadJobManager.class);

	public static final String UPLOAD_JOB_XML = "upload-job.xml";
	
	private File uploadJobFile;
	
	/**
	 * Initialize UploadJobManager empty and reset uploadJobFile
	 * with method setUploadJobFile.
	 */
	public UploadJobManager() {
	}
	
	/**
	 * Initialize UploadJobManager with current upload folder path.
	 * @param uploadFolder
	 */
	public UploadJobManager(final String uploadFolderPath) {
		this.uploadJobFile = new File(
			uploadFolderPath
			+ File.separatorChar
			+ UPLOAD_JOB_XML);
		logger.info("UploadJobManager initialized with file: "
			+ this.uploadJobFile.getAbsolutePath());
	}
	
	/**
	 * Initialize UploadJobManager with UploadJob file.
	 * @param uploadFolder
	 */
	public UploadJobManager(final File uploadJobFile) {
		this.uploadJobFile = uploadJobFile;
		logger.info("UploadJobManager initialized with file: "
			+ this.uploadJobFile.getAbsolutePath());
	}
	
	/* (non-Javadoc)
	 * @see org.shanoir.uploader.upload.IUploadJobManager#writeUploadJob(org.shanoir.uploader.upload.UploadJob)
	 */
	public void writeUploadJob(final UploadJob uploadJob) {
		JAXBContext jaxbContext;
		try {
			jaxbContext = JAXBContext.newInstance(UploadJob.class);
			Marshaller jaxbMarshaller = jaxbContext.createMarshaller();
			jaxbMarshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
			jaxbMarshaller.marshal(uploadJob, uploadJobFile);
		} catch (JAXBException e) {
			logger.error(e);
		}
	}

	/* (non-Javadoc)
	 * @see org.shanoir.uploader.upload.IUploadJobManager#readUploadJob()
	 */
	public UploadJob readUploadJob() {
		try {
			final JAXBContext jaxbContext = JAXBContext.newInstance(UploadJob.class);
			final Unmarshaller jaxbUnmarshaller = jaxbContext.createUnmarshaller();
			final UploadJob uploadJob = (UploadJob) jaxbUnmarshaller.unmarshal(uploadJobFile);
			return uploadJob;
		} catch (JAXBException e) {
			logger.error(e);
		}
		return null;
	}

	public File getUploadJobFile() {
		return uploadJobFile;
	}

	public void setUploadJobFile(File uploadJobFile) {
		this.uploadJobFile = uploadJobFile;
	}
	
}
