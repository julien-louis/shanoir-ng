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

/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package org.shanoir.ng.solr.service;

import java.util.List;

import org.shanoir.ng.shared.exception.RestServiceException;
import org.shanoir.ng.solr.model.ShanoirSolrDocument;
import org.shanoir.ng.solr.model.ShanoirSolrQuery;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.solr.core.query.result.SolrResultPage;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * @author yyao
 *
 */
public interface SolrService {
	
	@PreAuthorize("hasRole('ADMIN')")
	void addToIndex(ShanoirSolrDocument document);
	
	void deleteFromIndex(Long datasetId);
	
	public void deleteFromIndex(List<Long> datasetIds);
	
	void indexAll();

	SolrResultPage<ShanoirSolrDocument> facetSearch(ShanoirSolrQuery query, Pageable pageable) throws RestServiceException;

	void indexDataset(Long datasetId);
	
	void indexDatasets(List<Long> datasetIds);

	Page<ShanoirSolrDocument> getByIdIn(List<Long> datasetIds, Pageable pageable);

	void addAllToIndex(List<ShanoirSolrDocument> documents);

}
