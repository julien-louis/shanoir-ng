package org.shanoir.ng.exporter.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.io.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.shanoir.ng.bids.service.BIDSServiceImpl;
import org.shanoir.ng.dataset.modality.MrDataset;
import org.shanoir.ng.dataset.model.Dataset;
import org.shanoir.ng.dataset.model.DatasetExpression;
import org.shanoir.ng.dataset.security.DatasetSecurityService;
import org.shanoir.ng.datasetacquisition.model.DatasetAcquisition;
import org.shanoir.ng.datasetacquisition.model.mr.MrDatasetAcquisition;
import org.shanoir.ng.datasetfile.DatasetFile;
import org.shanoir.ng.examination.model.Examination;
import org.shanoir.ng.examination.service.ExaminationService;
import org.shanoir.ng.shared.model.Subject;
import org.shanoir.ng.shared.model.SubjectStudy;
import org.shanoir.ng.shared.repository.SubjectStudyRepository;
import org.shanoir.ng.utils.ModelsUtil;
import org.shanoir.ng.utils.usermock.WithMockKeycloakUser;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.BDDMockito.given;

/**
 * Test class for BIDS service class.
 * @author JCome
 *
 */

@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class BidsServiceTest {

	@Mock
	private ExaminationService examService;

	@Mock
	private SubjectStudyRepository subjectStudyRepository;

	@Mock
	DatasetSecurityService datasetSecurityService;

	@InjectMocks
	@Spy
	private BIDSServiceImpl service = new BIDSServiceImpl();
	
	@Mock
	private ObjectMapper objectMapper;
	
	String studyName = "STUDY";

	Examination exam = ModelsUtil.createExamination();
	Subject subject = new Subject();
	
	public static String tempFolderPath;

	@BeforeEach
	public void setUp() throws IOException {
        String property = "java.io.tmpdir";
        tempFolderPath = System.getProperty(property) + "/tmpTest/";
        File tempFile = new File(tempFolderPath);
        tempFile.mkdirs();

        File file = new File(tempFolderPath);
		file.mkdirs();
	    System.setProperty("bidsStorageDir", tempFolderPath);
		ReflectionTestUtils.setField(service, "bidsStorageDir", tempFolderPath);

		exam.setId(Long.valueOf("13851681"));
		// Create a full study with some data and everything
		subject.setId(Long.valueOf("123"));
		subject.setName("name");

		Dataset ds = new MrDataset();
		ds.setId(Long.valueOf("1684"));

		DatasetAcquisition dsa = new MrDatasetAcquisition();
		dsa.setExamination(exam);
		dsa.setDatasets(Collections.singletonList(ds));

		ds.setDatasetAcquisition(dsa);

		exam.setDatasetAcquisitions(Collections.singletonList(dsa));
		
		// Create some dataFile and register it to be copied
		File dataFile = new File(tempFolderPath + "test.test");
		dataFile.createNewFile();

		DatasetExpression dsExpr = new DatasetExpression();
		DatasetFile dsFile = new DatasetFile();
		dsFile.setDatasetExpression(dsExpr);
		dsFile.setPacs(false);
		dsFile.setPath("file://" + dataFile.getAbsolutePath());
		dsExpr.setDatasetFiles(Collections.singletonList(dsFile));

		ds.setDatasetExpressions(Collections.singletonList(dsExpr));
	}

	@Test
	@WithMockKeycloakUser(id = 1, username = "jlouis", authorities = { "ROLE_ADMIN" })
	public void testExportAsBids() throws IOException, InterruptedException {
		//GIVEN a study full of data

		// Mock on rest template to get the list of subjects
		List<SubjectStudy> subjectStudies = new ArrayList<>();
		SubjectStudy susu = new SubjectStudy();
		susu.setSubject(this.subject);
		subjectStudies.add(	susu);
		given(subjectStudyRepository.findByStudy_Id(exam.getStudyId())).willReturn(subjectStudies);
		
		// Mock on examination service to get the list of subject
		given(examService.findBySubjectId(subject.getId())).willReturn(Collections.singletonList(exam));

		// WHEN we export the data
		service.exportAsBids(exam.getStudyId(), studyName);
		
		// THEN the bids folder is generated with study - subject - exam - data
		File studyFile = new File(tempFolderPath + "stud-" + exam.getStudyId() + "" + studyName);
		assertTrue(studyFile.exists());

		File subjectFile = new File(studyFile.getAbsolutePath() + "/sub-1" + subject.getName());
		assertTrue(subjectFile.exists());

		File examFile = new File(subjectFile.getAbsolutePath() + "/ses-" + exam.getId());
		// No exam files as there is only one datasetAcquisition
		assertFalse(examFile.exists());
	}

	@AfterEach
	public void tearDown() {
		// delete files
        File tempFile = new File(tempFolderPath);
        if (tempFile.exists()) {
        	FileUtils.deleteQuietly(tempFile);
        }
	}
}

