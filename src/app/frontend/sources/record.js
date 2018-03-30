import LoLHTTPBase from './lol_http_base';
import axios from 'axios';

export default class Record extends LoLHTTPBase {
  static resource_path = '/records';

  static post(params) {
      console.log(`CREATE: ${this.resource_path}\n\n`);
      return axios.post(`${this.resource_path}`, params);
  }
  static put(id, params) {
      console.log(`UPDATE: ${this.resource_path}/${id}\n\n`);
      return axios.put(`${this.resource_path}/${id}`, params);
  }
}
