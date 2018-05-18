import {observable} from 'mobx';
import RecordAttachments from '../sources/record_attachments';

export default class MediaItemStore {
  id = null;
  @observable record_id = null;

  @observable file = null;
  @observable attachment_type = null;
  @observable title = null;
  @observable caption = null;
  @observable credit = null;
  @observable is_primary = false;

  persist() {
    const data = new FormData();
    data.append('attachable_attributes[title]', this.title);
    data.append('attachable_attributes[caption]', this.caption);
    data.append('attachable_attributes[credit]', this.credit);
    data.append('attachable_attributes[primary]', this.is_primary);

    if( this.id ) {
      return RecordAttachments.update(this.record_id, this.id, data);
    }else {
      data.append('attachment_type', this.attachment_type);
      data.append('attachable_attributes[file]', this.file);
      return RecordAttachments.create(this.record_id, data);
    }
  }

  static fromJS(object, record_id) {
    const store = new MediaItemStore();

    Object.assign(store, object);
    store.record_id = record_id;

    return store;
  }
}
