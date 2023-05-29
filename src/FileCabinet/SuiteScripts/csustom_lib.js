/**
 * @NApiVersion 2.1
 */
define(['N/record', 'N/search', 'N/sftp'],
    /**
     * @param{record} record
     * @param{search} search
     * @param{sftp} sftp
     */
    (record, search, sftp) => {
        const establishSFTPConnection = (connctionObj) => {
            // Establishing SFTP connection...
            log.debug('Establishing SFTP connection...');
            let connection = sftp.createConnection({
                username: connctionObj.userName,
                passwordGuid: connctionObj.passwordGuid,
                url: connctionObj.sftpUrl,
                port: 22,
                hostKey: connctionObj.hostKey
            });
            log.debug('Connection established!');
            return connection;
        }
        const sftpList = (connection, directory) => {
            let list
            if (directory) {
                list = connection.list({
                    path: directory
                });
            } else {
                list = connection.list({
                    path: ''
                });
            }
            log.debug('Items in directory ' + directory + ' at the beginning: ' + list.length);
            return list;
        }
        const sftpFileDownload = (connection, directory, fileName) => {
            let downloadedFile = null;
            if (directory) {
                downloadedFile = connection.download({
                    directory: directory,
                    filename: fileName
                });
            } else {
                downloadedFile = connection.download({
                    filename: fileName
                });
            }
            return downloadedFile;
        }

        return {
            establishSFTPConnection,
            sftpFileDownload,
            sftpList
        }

    });