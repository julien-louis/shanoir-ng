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

package org.shanoir.uploader.action;

import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Properties;

import javax.swing.JFrame;
import javax.swing.JOptionPane;

import org.apache.log4j.Logger;
import org.shanoir.uploader.ShUpConfig;
import org.shanoir.uploader.gui.LanguageConfigurationWindow;

public class LanguageConfigurationListener implements ActionListener {

	private static Logger logger = Logger.getLogger(LanguageConfigurationListener.class);
	final String ENGLISH_LANGUAGE = "ENGLISH";
	final String FRENCH_LANGUAGE = "FRENCH";

	public LanguageConfigurationWindow languageWindow;

	public LanguageConfigurationListener(LanguageConfigurationWindow languageWindow) {
		this.languageWindow = languageWindow;
	}

	public void actionPerformed(ActionEvent event) {
		if (languageWindow.rbEnglish.isSelected()) {
			logger.info("English language configuration: Starting...");
			String fileName = languageWindow.shanoirUploaderFolder + File.separator
					+ ShUpConfig.LANGUAGE_PROPERTIES;
			final File propertiesFile = new File(fileName);
			boolean propertiesExists = propertiesFile.exists();
			if (propertiesExists) {

				try {
					Properties props = loadProperties(fileName);
					props.setProperty("shanoir.uploader.language", ENGLISH_LANGUAGE);

					// Store the new configuration in the language.properties file
					OutputStream out = new FileOutputStream(propertiesFile);
					props.store(out, "Language Configuration");

					String message = "<html>"
							+ languageWindow.resourceBundle.getString(
									"shanoir.uploader.configurationMenu.language.configure.english.message.part1")
							+ "</html>" + "\n" + "\n" + "<html> <b> "
							+ languageWindow.resourceBundle.getString(
									"shanoir.uploader.configurationMenu.language.configure.english.message.part2")
							+ "</html>" + "\n";
					JOptionPane.showMessageDialog(new JFrame(), message,
							languageWindow.resourceBundle
									.getString("shanoir.uploader.configurationMenu.language.configure.succeeded.title"),
							JOptionPane.INFORMATION_MESSAGE);
					logger.info("English language successfully configured");

				} catch (Exception e) {
					logger.error("Failed to configure english language : " + e.getMessage());
				}

			}

		} else if (languageWindow.rbFrench.isSelected()) {
			logger.info("French language configuration: Starting...");

			String fileName = languageWindow.shanoirUploaderFolder + File.separator
					+ ShUpConfig.LANGUAGE_PROPERTIES;

			final File propertiesFile = new File(fileName);
			boolean propertiesExists = propertiesFile.exists();
			if (propertiesExists) {

				try {
					Properties props = loadProperties(fileName);
					props.setProperty("shanoir.uploader.language", FRENCH_LANGUAGE);

					// Store the new configuration in the language.properties file
					OutputStream out = new FileOutputStream(propertiesFile);
					props.store(out, "Language Configuration");

					String message = "<html>"
							+ languageWindow.resourceBundle.getString(
									"shanoir.uploader.configurationMenu.language.configure.french.message.part1")
							+ "</html>" + "\n" + "\n" + "<html> <b> "
							+ languageWindow.resourceBundle.getString(
									"shanoir.uploader.configurationMenu.language.configure.french.message.part2")
							+ "</html>" + "\n";
					JOptionPane.showMessageDialog(new JFrame(), message,
							languageWindow.resourceBundle
									.getString("shanoir.uploader.configurationMenu.language.configure.succeeded.title"),
							JOptionPane.INFORMATION_MESSAGE);
					logger.info("French language successfully configured");

				} catch (Exception e) {
					logger.error("Failed to configure french language : " + e.getMessage());
				}

			}

		}

	}

	public static Properties loadProperties(String fileName) {
		InputStream propsFile;
		Properties tempProp = new Properties();
		try {
			propsFile = new FileInputStream(fileName);
			tempProp.load(propsFile);
			propsFile.close();
		} catch (IOException ioe) {
			ioe.printStackTrace();
			System.exit(0);
		}
		return tempProp;
	}
}
