echo "Creating databases, starting..."
mysql -uroot -ppassword -e "CREATE DATABASE users"
mysql -uroot -ppassword -e "CREATE DATABASE studies"
mysql -uroot -ppassword -e "CREATE DATABASE import"
mysql -uroot -ppassword -e "CREATE DATABASE datasets"
mysql -uroot -ppassword -e "CREATE DATABASE preclinical"
mysql -uroot -ppassword -e "CREATE USER 'preclinical'@'localhost' IDENTIFIED BY 'password';"
mysql -uroot -ppassword -e "CREATE USER 'preclinical'@'%' IDENTIFIED BY 'password';"
mysql -uroot -ppassword -e "GRANT ALL ON *.* TO 'preclinical'@'localhost';"
mysql -uroot -ppassword -e "GRANT ALL ON *.* TO 'preclinical'@'%';"
echo "Creating databases, finished."
