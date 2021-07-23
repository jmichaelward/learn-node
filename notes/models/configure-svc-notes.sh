### Create the database for the notesentication service.

sudo mysql --user=root <<<EOF
CREATE DATABASE notes;
CREATE USER 'notes'@'localhost' IDENTIFIED BY 'notes';
GRANT ALL PRIVILEGES ON notes.* TO 'notes'@'localhost' WITH GRANT OPTION;
EOF

### Set up the notesentication service code
sudo mkdir -p /opt/notes
sudo chmod 777 /opt/notes
(cd /build-users; tar cf - .) | (cd /opt/notes; tar xf -)
(
cd /opt/notes
rm -rf node_modules package-lock.json users-sequelize.sqlite3
npm install
)
