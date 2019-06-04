package org.shanoir.ng.dataset;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.BDDMockito.given;
import static org.shanoir.ng.utils.assertion.AssertUtils.assertAccessAuthorized;
import static org.shanoir.ng.utils.assertion.AssertUtils.assertAccessDenied;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mockito;
import org.shanoir.ng.dataset.modality.MrDataset;
import org.shanoir.ng.dataset.model.Dataset;
import org.shanoir.ng.dataset.repository.DatasetRepository;
import org.shanoir.ng.dataset.service.DatasetService;
import org.shanoir.ng.shared.communication.StudyCommunicationService;
import org.shanoir.ng.shared.exception.ShanoirException;
import org.shanoir.ng.shared.paging.PageImpl;
import org.shanoir.ng.utils.ModelsUtil;
import org.shanoir.ng.utils.usermock.WithMockKeycloakUser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.test.context.support.WithAnonymousUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

/**
 * User security service test.
 * 
 * @author jlouis
 * 
 */
@RunWith(SpringRunner.class)
@SpringBootTest
@EnableGlobalMethodSecurity(prePostEnabled = true)
@ActiveProfiles("test")
public class DatasetServiceSecurityTest {

	private static final long LOGGED_USER_ID = 2L;
	private static final String LOGGED_USER_USERNAME = "logged";
	private static final long ENTITY_ID = 1L;
	
	@Autowired
	private DatasetService service;
	
	@MockBean
	private DatasetRepository repository;
	
	@MockBean
	StudyCommunicationService commService;
	
	@Before
	public void setup() {
		given(commService.hasRightOnStudy(Mockito.anyLong(), Mockito.anyString())).willReturn(false);
		given(commService.hasRightOnStudies(Mockito.any(), Mockito.anyString())).willReturn(new HashSet<Long>());
	}
	
	@Test
	@WithAnonymousUser
	public void testAsAnonymous() throws ShanoirException {
		given(commService.hasRightOnStudy(Mockito.anyLong(), Mockito.anyString())).willReturn(true);
		Set<Long> ids = Mockito.anySetOf(Long.class);
		given(commService.hasRightOnStudies(ids, Mockito.anyString())).willReturn(ids);
		
		assertAccessDenied(service::findById, ENTITY_ID);
		assertAccessDenied(service::findAll);
		assertAccessDenied(service::findPage, new PageRequest(0, 10));
		assertAccessDenied(service::create, mockDataset());
		assertAccessDenied(service::update, mockDataset(1L));
		assertAccessDenied(service::deleteById, ENTITY_ID);
	}

	@Test
	@WithMockKeycloakUser(id = LOGGED_USER_ID, username = LOGGED_USER_USERNAME, authorities = { "ROLE_USER" })
	public void testAsUser() throws ShanoirException {
		testFindOne();
		testFindAll();
		testFindPage();
		testCreate();
		testUpdateDenied();
		testDeleteDenied();
	}
	
	@Test
	@WithMockKeycloakUser(id = LOGGED_USER_ID, username = LOGGED_USER_USERNAME, authorities = { "ROLE_EXPERT" })
	public void testAsExpert() throws ShanoirException {
		testFindOne();
		testFindAll();
		testFindPage();
		testCreate();
		testUpdateByExpert();
		testDeleteByExpert();
	}
	
	@Test
	@WithMockKeycloakUser(id = LOGGED_USER_ID, username = LOGGED_USER_USERNAME, authorities = { "ROLE_ADMIN" })
	public void testAsAdmin() throws ShanoirException {
		assertAccessAuthorized(service::findById, ENTITY_ID);
		assertAccessAuthorized(service::findAll);
		assertAccessAuthorized(service::findPage, new PageRequest(0, 10));
		assertAccessAuthorized(service::create, mockDataset());
		assertAccessAuthorized(service::update, mockDataset(1L));
		assertAccessAuthorized(service::deleteById, ENTITY_ID);
	}
	
	
	private void testFindOne() throws ShanoirException {
		given(commService.hasRightOnStudy(1L, "CAN_SEE_ALL")).willReturn(false);
		given(repository.findOne(1L)).willReturn(mockDataset(1L));
		assertAccessDenied(service::findById, 1L);
		given(commService.hasRightOnStudy(1L, "CAN_SEE_ALL")).willReturn(true);
		given(repository.findOne(1L)).willReturn(mockDataset(1L));	
		assertNotNull(service.findById(1L));
	}
	

	private void testFindAll() throws ShanoirException {
		List<Dataset> dsList = new ArrayList<>();
		MrDataset ds1 = mockDataset(1L); ds1.setStudyId(1L); dsList.add(ds1);
		MrDataset ds2 = mockDataset(2L); ds1.setStudyId(1L); dsList.add(ds2);
		MrDataset ds3 = mockDataset(3L); ds1.setStudyId(1L); dsList.add(ds3);
		MrDataset ds4 = mockDataset(4L); ds1.setStudyId(2L); dsList.add(ds4);
		given(repository.findAll()).willReturn(dsList);
		given(commService.hasRightOnStudies(new HashSet<Long>(Arrays.asList(1L, 2L)), "CAN_SEE_ALL")).willReturn(new HashSet<Long>(Arrays.asList(1L)));
		assertEquals(3, service.findAll().size());		
	}
	
	private void testFindPage() throws ShanoirException {
		List<Dataset> dsList = new ArrayList<>();
		MrDataset ds1 = mockDataset(1L); ds1.setStudyId(1L); dsList.add(ds1);
		MrDataset ds2 = mockDataset(2L); ds1.setStudyId(1L); dsList.add(ds2);
		MrDataset ds3 = mockDataset(3L); ds1.setStudyId(1L); dsList.add(ds3);
		MrDataset ds4 = mockDataset(4L); ds1.setStudyId(2L); dsList.add(ds4);		
		Pageable pageable = new PageRequest(0, 10);
		given(repository.findAll(pageable)).willReturn(new PageImpl<>(dsList));
		given(commService.hasRightOnStudies(new HashSet<Long>(Arrays.asList(1L, 2L)), "CAN_SEE_ALL")).willReturn(new HashSet<Long>(Arrays.asList(1L)));
		given(commService.hasRightOnStudies(new HashSet<Long>(Arrays.asList(1L)), "CAN_SEE_ALL")).willReturn(new HashSet<Long>(Arrays.asList(1L)));
		
		assertAccessDenied(service::findPage, pageable);
		
		List<Dataset> dsList2 = new ArrayList<>();
		MrDataset ds11 = mockDataset(1L); ds11.setStudyId(1L); dsList2.add(ds11);
		MrDataset ds21 = mockDataset(2L); ds21.setStudyId(1L); dsList2.add(ds21);
		MrDataset ds31 = mockDataset(3L); ds31.setStudyId(1L); dsList2.add(ds31);
		given(repository.findAll(pageable)).willReturn(new PageImpl<>(dsList2));
		
		assertAccessAuthorized(service::findPage, pageable);
	}
	
	
	private void testCreate() throws ShanoirException {
		MrDataset mrDs = mockDataset();
		mrDs.setStudyId(10L);
		given(commService.hasRightOnStudy(10L, "CAN_ADMINISTRATE")).willReturn(true);
		given(commService.hasRightOnStudy(10L, "CAN_SEE_ALL")).willReturn(true);
		given(commService.hasRightOnStudy(10L, "CAN_DOWNLOAD")).willReturn(true);
		assertAccessDenied(service::create, mrDs);
		given(commService.hasRightOnStudy(10L, "CAN_IMPORT")).willReturn(true);
		assertAccessAuthorized(service::create, mrDs);
	}
	
	
	private void testDeleteDenied() throws ShanoirException {
		given(commService.hasRightOnStudy(Mockito.anyLong(), Mockito.anyString())).willReturn(true);
		given(repository.findOne(Mockito.anyLong())).willReturn(mockDataset(1L));
		assertAccessDenied(service::deleteById, 1L);
	}

	private void testUpdateDenied() throws ShanoirException {
		given(commService.hasRightOnStudy(Mockito.anyLong(), Mockito.anyString())).willReturn(true);
		MrDataset mrDs = mockDataset(1L);
		mrDs.setStudyId(10L);
		given(repository.findOne(Mockito.anyLong())).willReturn(mrDs);
		assertAccessDenied(service::update, mrDs);
	}
	
	private void testDeleteByExpert() throws ShanoirException {
		MrDataset mrDs = mockDataset(1L);
		mrDs.setStudyId(10L);
		given(repository.findOne(1L)).willReturn(mrDs);
		given(commService.hasRightOnStudy(10L, "CAN_ADMINISTRATE")).willReturn(false);
		given(commService.hasRightOnStudy(10L, "CAN_IMPORT")).willReturn(true);
		given(commService.hasRightOnStudy(10L, "CAN_SEE_ALL")).willReturn(true);
		given(commService.hasRightOnStudy(10L, "CAN_DOWNLOAD")).willReturn(true);
		assertAccessDenied(service::deleteById, 1L);
		given(commService.hasRightOnStudy(10L, "CAN_ADMINISTRATE")).willReturn(true);
		assertAccessAuthorized(service::deleteById, 1L);
	}

	private void testUpdateByExpert() throws ShanoirException {
		MrDataset mrDs = mockDataset(1L);
		mrDs.setStudyId(10L);
		given(repository.findOne(1L)).willReturn(mrDs);
		given(commService.hasRightOnStudy(10L, "CAN_ADMINISTRATE")).willReturn(false);
		given(commService.hasRightOnStudy(10L, "CAN_IMPORT")).willReturn(true);
		given(commService.hasRightOnStudy(10L, "CAN_SEE_ALL")).willReturn(true);
		given(commService.hasRightOnStudy(10L, "CAN_DOWNLOAD")).willReturn(true);
		given(commService.hasRightOnStudy(20L, "CAN_ADMINISTRATE")).willReturn(false);
		given(commService.hasRightOnStudy(30L, "CAN_ADMINISTRATE")).willReturn(true);
		
		MrDataset mrDsUpdated = mockDataset(1L);
		mrDsUpdated.setStudyId(10L);
		mrDsUpdated.setSubjectId(123L);
		assertAccessDenied(service::update, mrDsUpdated);
		given(commService.hasRightOnStudy(10L, "CAN_ADMINISTRATE")).willReturn(true);
		assertAccessAuthorized(service::update, mrDsUpdated);
		
		mrDsUpdated.setStudyId(20L);
		assertAccessDenied(service::update, mrDsUpdated);
		
		mrDsUpdated.setStudyId(30L);
		assertAccessAuthorized(service::update, mrDsUpdated);
	}

	
	private MrDataset mockDataset(Long id) {
		MrDataset ds = ModelsUtil.createMrDataset();
		ds.setId(id);
		return ds;
	}
	
	private MrDataset mockDataset() {
		return mockDataset(null);
	}
}
