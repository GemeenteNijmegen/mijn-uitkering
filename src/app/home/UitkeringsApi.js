const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const ObjectMapper = require('object-mapper');

class UitkeringsApi {
    constructor(bsn, Connector) {
        this.bsn = bsn;
        this.connector = new Connector(bsn);
    }

    async getUitkeringen() {
        let data = await this.connector.requestData();
        const object = await xml2js.parseStringPromise(data);
        console.debug(object);
        const uitkeringsRows =  this.mapUitkeringsRows(object);
        const fields = this.mapUitkering(uitkeringsRows);
        console.debug(uitkeringsRows);
        console.debug(fields);
        return fields;
    }

    mapUitkeringsRows(object) {
        const map = {
            'soap:Envelope.soap:Body[0].mij:dataResponse[0].groups[].group[0]': {
                key: 'uitkeringen',
                transform: ((value) => {
                    const groups = value.filter((group) => {
                        return group.groupName[0] == 'uitkeringen';
                    });
                    return groups[0].rows[0]
                })
            }
        }
        return ObjectMapper(object, map);
    }

    mapUitkering(object) {
        const map = {
            'uitkeringen.row[].pageName[0]': 'uitkeringen[].type',
            'uitkeringen.row[].fields[0].field': {
                key: 'fields',
                transform: ((value) => { 
                    console.debug(value);
                    return (value.length > 0) ? value[0].map((el) => {
                        const obj = {};
                        obj[el.name] = el.value[0];
                        console.debug(el);
                        return obj;
                    }) : null;
                })
            }
        };
        return ObjectMapper(object, map);
    }
}

class FileConnector {
    constructor(bsn) {
        this.bsn = bsn;
    }

    async requestData() {
        const filePath = path.join('tests/responses', this.bsn + '.xml');
        return await this.getStringFromFilePath(filePath)
        .then((data) => { return [data] })
        .catch((err) => { return [] });
    }

    async getStringFromFilePath(filePath) {
        return new Promise((res, rej) => {
            fs.readFile(path.join(__dirname, filePath), (err, data) => {
                if (err) return rej(err);
                return res(data.toString());
            });
        });
    }
}

exports.UitkeringsApi = UitkeringsApi;
exports.FileConnector = FileConnector;