package org.shanoir.ng.center.repository;

import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.shanoir.ng.shared.dto.IdNameDTO;
import org.springframework.stereotype.Component;

/**
 * Implementation of custom repository for centers.
 * 
 * @author msimon
 */
@Component
public class CenterRepositoryImpl implements CenterRepositoryCustom {

	@PersistenceContext
	private EntityManager em;

	@SuppressWarnings("unchecked")
	@Override
	public List<IdNameDTO> findIdsAndNames() {
		return em.createNativeQuery("SELECT id, name FROM center", "centerNameResult").getResultList();
	}

}
