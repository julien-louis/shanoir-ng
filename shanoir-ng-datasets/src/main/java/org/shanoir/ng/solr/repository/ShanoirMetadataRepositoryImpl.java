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
package org.shanoir.ng.solr.repository;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.Query;

import org.shanoir.ng.solr.model.ShanoirMetadata;
import org.springframework.stereotype.Component;

/**
 * @author yyao
 *
 */

@Component
@SuppressWarnings("unchecked")
public class ShanoirMetadataRepositoryImpl implements ShanoirMetadataRepositoryCustom {
	@PersistenceContext
	private EntityManager em;
	
	@Override
	public List<ShanoirMetadata> findAllAsSolrDoc() {
		List<ShanoirMetadata> result = new ArrayList<>();
		Query mrQuery = em.createNativeQuery(
				"SELECT d.id as datasetId, dm.name as datasetName, dm.dataset_modality_type as datasetType, mdm.mr_dataset_nature as datasetNature, d.creation_date as datasetCreationDate, e.comment as examinationComment, e.examination_date as examinationDate, su.name as subjectName, st.name as studyName, e.study_id as studyId, c.name as centerName, mrp.slice_thickness as sliceThickness, mrp.pixel_bandwidth as pixelBandwidth, mrp.magnetic_field_strength as magneticFieldStrength\n"
				+ " FROM dataset d"
				+ " LEFT JOIN dataset_acquisition da on da.id = d.dataset_acquisition_id"
				+ " LEFT JOIN mr_dataset_acquisition mda on mda.id = d.dataset_acquisition_id"
				+ " LEFT JOIN mr_protocol mrp on mrp.id = mda.mr_protocol_id"
				+ " LEFT JOIN examination e ON e.id = da.examination_id"
				+ " LEFT JOIN study st ON st.id = e.study_id"
				+ " LEFT JOIN center c ON c.id = e.center_id"
				+ " LEFT JOIN subject su ON su.id = d.subject_id, dataset_metadata dm, mr_dataset md"
				+ " LEFT JOIN mr_dataset_metadata mdm ON md.updated_mr_metadata_id = mdm.id"
				+ " WHERE d.updated_metadata_id = dm.id AND md.id = d.id;", "SolrResult");
		Query petQuery = em.createNativeQuery(
				"SELECT d.id as datasetId, dm.name as datasetName, dm.dataset_modality_type as datasetType, null as datasetNature, d.creation_date as datasetCreationDate, e.comment as examinationComment, e.examination_date as examinationDate, su.name as subjectName, st.name as studyName, e.study_id as studyId, c.name as centerName, null as sliceThickness, null as pixelBandwidth, null as magneticFieldStrength\n"
				+ " FROM dataset d"
				+ " LEFT JOIN dataset_acquisition da on da.id = d.dataset_acquisition_id"
				+ " LEFT JOIN examination e ON e.id = da.examination_id"
				+ " LEFT JOIN study st ON st.id = e.study_id"
				+ " LEFT JOIN center c ON c.id = e.center_id"
				+ " LEFT JOIN subject su ON su.id = d.subject_id, pet_dataset pd, dataset_metadata dm"
				+ " WHERE d.updated_metadata_id = dm.id AND pd.id = d.id;", "SolrResult");
		Query ctQuery = em.createNativeQuery(
				"SELECT d.id as datasetId, dm.name as datasetName, dm.dataset_modality_type as datasetType, null as datasetNature, d.creation_date as datasetCreationDate, e.comment as examinationComment, e.examination_date as examinationDate, su.name as subjectName, st.name as studyName, e.study_id as studyId, c.name as centerName, null as sliceThickness, null as pixelBandwidth, null as magneticFieldStrength\n"
				+ " FROM dataset d"
				+ " LEFT JOIN dataset_acquisition da on da.id = d.dataset_acquisition_id"
				+ " LEFT JOIN examination e ON e.id = da.examination_id"
				+ " LEFT JOIN study st ON st.id = e.study_id"
				+ " LEFT JOIN center c ON c.id = e.center_id"
				+ " LEFT JOIN subject su ON su.id = d.subject_id, ct_dataset cd, dataset_metadata dm"
				+ " WHERE d.updated_metadata_id = dm.id AND cd.id = d.id;", "SolrResult");
		Query genericQuery = em.createNativeQuery(
				"SELECT d.id as datasetId, dm.name as datasetName, dm.dataset_modality_type as datasetType, null as datasetNature, d.creation_date as datasetCreationDate, e.comment as examinationComment, e.examination_date as examinationDate, su.name as subjectName, st.name as studyName, e.study_id as studyId, c.name as centerName, null as sliceThickness, null as pixelBandwidth, null as magneticFieldStrength\n"
				+ " FROM dataset d"
				+ " LEFT JOIN dataset_acquisition da on da.id = d.dataset_acquisition_id"
				+ " LEFT JOIN examination e ON e.id = da.examination_id"
				+ " LEFT JOIN study st ON st.id = e.study_id"
				+ " LEFT JOIN center c ON c.id = e.center_id"
				+ " LEFT JOIN subject su ON su.id = d.subject_id, generic_dataset cd, dataset_metadata dm"
				+ " WHERE d.updated_metadata_id = dm.id AND cd.id = d.id;", "SolrResult");
	
		result.addAll(mrQuery.getResultList());
		result.addAll(petQuery.getResultList());
		result.addAll(ctQuery.getResultList());
		result.addAll(genericQuery.getResultList());

		return result;
	}

	@Override
	public ShanoirMetadata findOneSolrDoc(Long datasetId) {
		List<ShanoirMetadata> result = new ArrayList<>();

		Query mrQuery = em.createNativeQuery(
				"SELECT d.id as datasetId, dm.name as datasetName, dm.dataset_modality_type as datasetType, mdm.mr_dataset_nature as datasetNature, d.creation_date as datasetCreationDate, e.comment as examinationComment, e.examination_date as examinationDate, su.name as subjectName, st.name as studyName, e.study_id as studyId, c.name as centerName, mrp.slice_thickness as sliceThickness, mrp.pixel_bandwidth as pixelBandwidth, mrp.magnetic_field_strength as magneticFieldStrength\n"
				+ " FROM dataset d"
				+ " LEFT JOIN dataset_acquisition da on da.id = d.dataset_acquisition_id"
				+ " LEFT JOIN mr_dataset_acquisition mda on mda.id = d.dataset_acquisition_id"
				+ " LEFT JOIN mr_protocol mrp on mrp.id = mda.mr_protocol_id"
				+ " LEFT JOIN examination e ON e.id = da.examination_id"
				+ " LEFT JOIN study st ON st.id = e.study_id"
				+ " LEFT JOIN center c ON c.id = e.center_id"
				+ " LEFT JOIN subject su ON su.id = d.subject_id, dataset_metadata dm, mr_dataset md"
				+ " LEFT JOIN mr_dataset_metadata mdm ON md.updated_mr_metadata_id = mdm.id"
				+ " WHERE d.updated_metadata_id = dm.id AND md.id = d.id AND d.id = " + datasetId + ";", "SolrResult");
		Query petQuery = em.createNativeQuery(
				"SELECT d.id as datasetId, dm.name as datasetName, dm.dataset_modality_type as datasetType, null as datasetNature, d.creation_date as datasetCreationDate, e.comment as examinationComment, e.examination_date as examinationDate, su.name as subjectName, st.name as studyName, e.study_id as studyId, c.name as centerName, null as sliceThickness, null as pixelBandwidth, null as magneticFieldStrength\n"
				+ " FROM dataset d"
				+ " LEFT JOIN dataset_acquisition da on da.id = d.dataset_acquisition_id"
				+ " LEFT JOIN examination e ON e.id = da.examination_id"
				+ " LEFT JOIN study st ON st.id = e.study_id"
				+ " LEFT JOIN center c ON c.id = e.center_id"
				+ " LEFT JOIN subject su ON su.id = d.subject_id, pet_dataset pd, dataset_metadata dm"
				+ " WHERE d.updated_metadata_id = dm.id AND pd.id = d.id AND d.id = " + datasetId + ";", "SolrResult");
		Query ctQuery = em.createNativeQuery(
				"SELECT d.id as datasetId, dm.name as datasetName, dm.dataset_modality_type as datasetType, null as datasetNature, d.creation_date as datasetCreationDate, e.comment as examinationComment, e.examination_date as examinationDate, su.name as subjectName, st.name as studyName, e.study_id as studyId, c.name as centerName, null as sliceThickness, null as pixelBandwidth, null as magneticFieldStrength\n"
				+ " FROM dataset d"
				+ " LEFT JOIN dataset_acquisition da on da.id = d.dataset_acquisition_id"
				+ " LEFT JOIN examination e ON e.id = da.examination_id"
				+ " LEFT JOIN study st ON st.id = e.study_id"
				+ " LEFT JOIN center c ON c.id = e.center_id"
				+ " LEFT JOIN subject su ON su.id = d.subject_id, ct_dataset cd, dataset_metadata dm"
				+ " WHERE d.updated_metadata_id = dm.id AND cd.id = d.id AND d.id = " + datasetId + ";", "SolrResult");
		Query genericQuery = em.createNativeQuery(
				"SELECT d.id as datasetId, dm.name as datasetName, dm.dataset_modality_type as datasetType, null as datasetNature, d.creation_date as datasetCreationDate, e.comment as examinationComment, e.examination_date as examinationDate, su.name as subjectName, st.name as studyName, e.study_id as studyId, c.name as centerName, null as sliceThickness, null as pixelBandwidth, null as magneticFieldStrength\n"
				+ " FROM dataset d"
				+ " LEFT JOIN dataset_acquisition da on da.id = d.dataset_acquisition_id"
				+ " LEFT JOIN examination e ON e.id = da.examination_id"
				+ " LEFT JOIN study st ON st.id = e.study_id"
				+ " LEFT JOIN center c ON c.id = e.center_id"
				+ " LEFT JOIN subject su ON su.id = d.subject_id, generic_dataset gd, dataset_metadata dm"
				+ " WHERE d.updated_metadata_id = dm.id AND gd.id = d.id AND d.id = " + datasetId + ";", "SolrResult");

		result.addAll(mrQuery.getResultList());
		result.addAll(petQuery.getResultList());
		result.addAll(ctQuery.getResultList());
		result.addAll(genericQuery.getResultList());

		
		if (result.size() != 1) {
			return null;
		}
		
		return result.get(0);
	}
}