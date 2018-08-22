import {observable, computed} from 'mobx';
import CollectionModel from './collection';
import Record from "../sources/record";
import Attachment from './attachment';
import L from "leaflet";

export default class RecordModel {
  id = null;
  state;
  lat = 0;
  lng = 0;
  user = {};
  created_at;

  @observable title = '';
  @observable description = '';
  @observable credit = '';
  @observable location = null;
  @observable latlng = null;

  @observable like_count = 0;
  @observable view_count = 0;

  @observable date_from_object = {date: '', month: '', year: ''};
  @observable date_to_object = {date: '', month: '', year: ''};

  @observable image = null;
  @observable attachments = [];
  @observable current_attachment_item_index = this.attachments.length>0 ? 0 : null; //which media item is active (being edited)
  @observable collections = [];
  @observable collection_ids = [];

  @observable highlighted = false;
  @observable errors = {};

  @observable view_type = null;

  user_collections = [];
  everyone_collections = [];

  user_can_edit = false;
  user_can_like = true;

  persist() {
    if( this.id ) {
      return Record.update(null, this.id, {record: this.toJS()});
    }else {
      return Record.create(null, {record: this.toJS()});
    }
  }

  @computed get position() {
    return [this.lat, this.lng];
  }

  @computed get date_from() {
    const values = new Set( Object.values(this.date_from_object) );
    if( values.size === 1 && values.has("") ) return null;

    let date = new Date();
    date.setDate(this.date_from_object.date);
    date.setMonth(this.date_from_object.month-1);
    date.setFullYear(this.date_from_object.year);

    return date.toDateString();
  }
  set date_from(value) {
    if(value) {
      const date = new Date(value);
      this.date_from_object = {date: date.getDate(), month: date.getMonth()+1, year: date.getFullYear()};
    }else {
      this.date_from_object = {date: '', month: '', year: ''};
    }
  }
  get date_to() {
    const values = new Set( Object.values(this.date_to_object) );
    if( values.size === 1 && values.has("") ) return null;

    let date = new Date();
    date.setDate(this.date_to_object.date);
    date.setMonth(this.date_to_object.month-1);
    date.setFullYear(this.date_to_object.year);

    return date.toDateString();
  }
  set date_to(value) {
    if(value) {
      const date = new Date(value);
      this.date_to_object = {date: date.getDate(), month: date.getMonth()+1, year: date.getFullYear()};
    }else {
      this.date_to_object = {date: '', month: '', year: ''};
    }
  }

  setCurrentAttachmentItemAsPrimaryImage() {
    console.log("Set something", this.current_attachment_item);
  }

  @computed get current_attachment_item() {
    if( typeof this.current_attachment_item_index === "number" ) {
      return this.attachments[this.current_attachment_item_index];
    }
  }

  // @computed get _collection_ids() {
  //   return this.collections.map((c)=>c.id);
  // }
  // set _collection_ids(id) {
  //   //todo: make this work for multiple collections
  //   // const collection_ids = this.collection_ids.slice();
  //   // collection_ids.push(id);
  //   // this.collection_ids = collection_ids;
  //   this.collection_ids = [parseInt(id, 10)];
  // }

  @computed get user_can_edit_record() {
    return this.user_can_edit;
  }

  @computed get user_can_like_record() {
    return this.user_can_like;
  }

  incrementLikeCount() {
    Record.like(this.id).then((response) => {
      this.like_count = response.data.like_count;
    });
  }

  icon() {
    const default_icon = new L.Icon({
      iconUrl: require('../assets/images/record-marker.png'),
      iconRetinaUrl: require('../assets/images/record-marker-x2.png'),

      iconSize: [22, 30],
      shadowSize: [0, 0],
      iconAnchor: [11, 20],
      popupAnchor: [0, -33]
    });

    return default_icon;
  }

  // todo: wire this up to the record attachments
  @computed get has_hero_image() {
    return !!(this.image || this.hero_image);
  }

  // todo: wire this up to the hero_image_id attribute
  @computed get hero_image() {
    let hero = this.image;

    if( !hero ) {
      hero = this.media.first;
    }

    return hero;
  }

  @computed get has_media() {
    const media = this.media;

    return media.length > 0;
  }

  @computed get media() { // excludes youtube videos
    return this.attachments.filter((a) => a.is_media);
  }

  @computed get videos() {
    return this.attachments.filter((a) => a.is_video);
  }

  @computed get media_and_videos() {
    return this.attachments.filter((a) => a.is_video || a.is_media);
  }

  @computed get links() {
    return this.attachments.filter((a) => a.is_link);
  }

  @computed get documents() {
    return this.attachments.filter((a) => a.is_document);
  }

  @computed get text() {
    return this.attachments.filter((a) => a.is_text);
  }

  @computed get documents_and_images() {
    return this.attachments.filter((a) => a.is_document_or_image);
  }

  get_attachment(id) {
    return this.attachments.find((a) => parseInt(a.id, 10) === parseInt(id, 10));
  }

  toJS() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      lat: this.lat,
      lng: this.lng,
      date_from: this.date_from,
      date_to: this.date_to,
      collection_ids: this.collection_ids,
      user_collections: this.user_collections,
      everyone_collections: this.everyone_collections,
      location: this.location,
      credit: this.credit,
      view_type: this.view_type,
      attachments: this.attachments,
      user: this.user,
      user_can_edit: this.user_can_edit
    }
  }

  static fromJS(attributes, store) {
    let record = new RecordModel();

    record.store = store;

    Object.keys(attributes).map((property) => {
      record[property] = attributes[property];
    });

    if( attributes.hasOwnProperty('attachments') ) {
      record.attachments = attributes.attachments.map((attachment) => {
        return Attachment.fromJS(attachment, attributes.id);
      });
    }

    if( attributes.hasOwnProperty('collections') ) {
      record.collections = attributes.collections.map((c) => CollectionModel.fromJS(c, store, true));
    }

    return record;
  }

  resetState() {
    Object.getOwnPropertyNames(this).map((property) => {
      let value = this[property];
      switch(value.constructor) {
        case Array:
          this[property] = [];
          break;
        case Object:
          this[property] = {};
          break;
        case Number:
          this[property] = 0;
          break;
        case String:
          this[property] = "";
          break;
        default:
          this[property] = null;
          break;
      }
    });

    this.id = null;
    return this;
  }
}

window.RecordModel = RecordModel;
