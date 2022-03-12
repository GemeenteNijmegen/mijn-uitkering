const { ApiClient } = require('./ApiClient');

class BrpApi {
    constructor(client) {
        this.endpoint = process.env.BRP_API_URL ? process.env.BRP_API_URL : 'Irma';
        this.client = client ? client : new ApiClient();
    }

    async getBrpData(bsn) {
        let data = await this.client.requestData(this.endpoint, {"bsn": bsn}, {'Content-type': 'application/json'});
        if(data?.Persoon) {
            return data;
        }
        return false;
    }
}

exports.BrpApi = BrpApi;