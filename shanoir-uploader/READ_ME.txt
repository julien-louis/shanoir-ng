##############################################
Hints on working with ShanoirUploader
##############################################

####### Version update #############
For a new version, e.g. from v6.0.4 to v7.0.1:
Search with "6.0.4" on the folder shanoir-uploader and replace all occurrences with 7.0.1.
This is important, that all scripts .sh or .bat find the correct version to start and create
the correct folder.

####### Delivery of new Executable Jar version #############
1) Remove the 2 system path libraries lines from the pom.xml dependencies
as they should not be contained in the assembly.
2) Build latest version for delivery using the below mvn command:
Use "mvn clean compile assembly:single", to create one big jar containing everything

####### Complete your Maven repository #######

http://shanoir.gforge.inria.fr/doku.php?id=intern:shanoiruploader

## In the Shanoir project:
First, you need to get the WSDL files from the Shanoir server. To do so, you can
	* execute the Ant task ant build-server-java : This will create the wanted 
	wsdl files in the directory ${Shanoir_project_src}/resources/WEB-INF/wsdl.
	* execute the Ant task ant archive : This will generate the Shanoir.jar archive

All in one : build the following ant tasks : clean, clean_jboss, build-server-java, 
archive, explode

Now retrieve Shanoir librairies and copy them in your maven repository
	* copy (and rename) the Shanoir.jar archive 
			>>> cp ~/workspace/Shanoir/dist-dev/Shanoir.jar ~/.m2/repository/org/shanoir/shanoir/1.0.0/shanoir-1.0.0.jar
	* copy (and rename) 
			>>> cp ~/workspace/Shanoir/lib/dcm4che2-tool-dcmqr-custom.jar ~/.m2/repository/dcm4che2/tool/dcm4che2-tool-dcmqr-custom/1.0.0/dcm4che2-tool-dcmqr-custom-1.0.0.jar

## In the shanoir-uploader project:
-----------------------------------------------
!!! WARNING !!! For your very first compilation, 
please read the "First build of ShanoirUploader" section
-----------------------------------------------
	* execute mvn clean install in order to build your project
			>>> mvn clean install
	
	
####### First build of ShanoirUploader #######  

-----------------------------------------------
NB : Build ShanoirUploader (called "mvn install" below) =
		- command line : cd ~/workspace/shanoir-uploader &&  mvn install
		- or in Eclipse : right-click on the pom.xml and select Run As... Maven install
	 Sometimes it can be helpful to run a Maven clean before an Maven install.
-----------------------------------------------
	  
	* Comment the plugin <artifactId>webstart-maven-plugin</artifactId> and 
		<artifactId>maven-jarsigner-plugin</artifactId> in pom.xml file
	* mvn install
	* Uncomment the plugin <artifactId>webstart-maven-plugin</artifactId> and 
		<artifactId>maven-jarsigner-plugin</artifactId> in pom.xml file
	* mvn install