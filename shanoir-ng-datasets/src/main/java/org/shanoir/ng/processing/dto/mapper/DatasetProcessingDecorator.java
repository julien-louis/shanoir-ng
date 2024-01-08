package org.shanoir.ng.processing.dto.mapper;

import org.shanoir.ng.examination.dto.ExaminationDTO;
import org.shanoir.ng.processing.dto.DatasetProcessingDTO;
import org.shanoir.ng.processing.model.DatasetProcessing;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public abstract class DatasetProcessingDecorator implements DatasetProcessingMapper {

    @Autowired
    private DatasetProcessingMapper delegate;

    @Override
    public DatasetProcessingDTO datasetProcessingToDatasetProcessingDTO(DatasetProcessing processing) {

        if ( processing == null ) {
            return null;
        }


        DatasetProcessingDTO dto = delegate.datasetProcessingToDatasetProcessingDTO(processing);
        if(processing.getParent() != null){
            dto.setParentId(processing.getParent().getId());
        }
        return dto;
    }

    @Override
    public List<DatasetProcessingDTO> datasetProcessingsToDatasetProcessingDTOs(List<DatasetProcessing> processings) {
        return processings.stream().map(this::datasetProcessingToDatasetProcessingDTO).collect(Collectors.toList());
    }
}