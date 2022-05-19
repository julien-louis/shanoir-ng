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

package org.shanoir.ng.shared.configuration;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Page;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.Module;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jdk8.Jdk8Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class JacksonConfiguration {

    /**
     * Allows to configure the Jackson object mapper.
     *
     * @param objectMapper
     *            an instance of {@link ObjectMapper}.
     */
    @Autowired
    public void configureJacksonObjectMapper(final ObjectMapper objectMapper) {
        objectMapper
        		.registerModule(preparePageModule())
		        .registerModule(new JavaTimeModule())
		        .registerModule(new Jdk8Module())
				.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }


    /**
     * Allows to configure a {@link JsonSerializer} for pagination.
     *
     * @return an instance of {@link Module}.
     */
    private Module preparePageModule() {
        return new SimpleModule().addSerializer(Page.class, new JsonSerializer<>() {
            @Override
            public void serialize(@SuppressWarnings("rawtypes") final Page page, final JsonGenerator jsonGenerator,
                    final SerializerProvider serializers) throws IOException {

                jsonGenerator.writeStartObject();
                jsonGenerator.writeObjectField("content", page.getContent());
                jsonGenerator.writeNumberField("number", page.getNumber() + 1);
                jsonGenerator.writeNumberField("totalPages", page.getTotalPages());
                jsonGenerator.writeNumberField("totalElements", page.getTotalElements());
                jsonGenerator.writeNumberField("size", page.getSize());
                jsonGenerator.writeEndObject();
            }
        });
    }
}