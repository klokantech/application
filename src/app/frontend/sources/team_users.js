import LoLHTTPBase from './lol_http_base';
import axios from 'axios';

export default class TeamUsers extends LoLHTTPBase {
  static resource_path = '/teams';

  static all(team_id){
      this.resource_path = `/teams/${team_id}/users`;
      return super.all();
  }

  static post(team_id, params) {
      this.resource_path = `/teams/${team_id}/users`;
      console.log(`CREATE: ${this.resource_path}\n\n`);
      return axios.post(`${this.resource_path}`, params);
  }
  static destroy(team_id, id){
      this.resource_path = `/teams/${team_id}/users`;
      return super.destroy(id);
  }
}
