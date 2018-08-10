import React,{Component} from 'react';
import {inject, observer} from "mobx-react";
import Details from './details';
import Credits from './credits'
import Dates from './dates';
import Media from './media';
import CollectionsEditor from './collections_editor';
import Record from './../../../sources/record';
import RecordModel from './../../../models/record';

@inject('router', 'mapViewStore', 'recordFormStore', 'trayViewStore', 'collectionStore', 'currentUser')
@observer export default class RecordForm extends Component {
  constructor(props) {
    super(props);

    this.state = {errors: []};
  }

  componentWillMount() {
    if( this.props.trayViewStore.record ) {
      // duplicate the record object so that the one we're mutating isn't what may be visible in the tray (its observed
      // attributes will change in real-time, but aren't actually persisted which might be confusing...)
      const record = RecordModel.fromJS(this.props.trayViewStore.record.toJS(), this.props.trayViewStore.record.store);
      this.props.recordFormStore.record = record;
    }else if( this.props.match.params.id && this.props.match.params.id !== 'new'  ) {
      Record.show(null, this.props.match.params.id).then((response) => {
        this.props.recordFormStore.record = RecordModel.fromJS(response.data);
      });
    }

    if( this.props.trayViewStore.cards.size === 0 ) {
      setTimeout(() => {
        if( this.props.match.params.id ) {
          this.props.trayViewStore.fetchRecord(this.props.match.params.id, true);
        }else {
          this.props.trayViewStore.restoreRootState();
        }
      }, 10);
    }
  }

  componentWillUnmount() {
      this.props.recordFormStore.record = new RecordModel()
  }

  handleClickedOnSave(event) {
    event.preventDefault();
    // when successfully updating a Record, we should propagate the updated data throughout the stores that are
    // rendering it. since the tray and map render their data from the trayViewStore.cards observable, we can just
    // overwrite the data there (see addOrUpdateRecord)
    this.props.recordFormStore.record.persist().then((response) => {
      let card = this.props.trayViewStore.addOrUpdateRecord(response.data);

      card = this.props.trayViewStore.cards.get(card.id);
      this.props.trayViewStore.record = card.data;
      this.props.trayViewStore.tray_is_visible = true;
      this.props.recordFormStore.record = new RecordModel();

      const {push} = {...this.props.router};
      push(`/map/records/${card.data.id}`);
    }).catch((error) => {
      this.props.recordFormStore.record.errors = error.response.data;
    })
  }

  handleClickedDelete(event) {
    event.preventDefault();
    if (window.confirm("Really delete this record?")) {
      Record.destroy(null, this.props.recordFormStore.record.id).then((response) => {
        this.props.trayViewStore.cards.delete(`record_${this.props.recordFormStore.record.id}`);
        this.props.router.push('/map');
        this.props.recordFormStore.record_id = null;
      }).catch((error) => {
        console.log("error destroying record");
      });
    }
  }

  handleCloseOnClick(event) {
    event.preventDefault();

    if(this.props.match.params.collection_id) {
      this.props.router.push(`/map/collections/${this.props.match.params.collection_id}/records/${this.props.match.params.id}`);
    }else if(this.props.match.params.id) {
      this.props.trayViewStore.locked = false;
      this.props.router.push(`/map/records/${this.props.match.params.id}`);
    }else {
      this.props.trayViewStore.locked = false;
      this.props.router.push(`/map`);
    }

    this.props.mapViewStore.add_record_mode = false;
    this.props.trayViewStore.tray_is_visible = true;
  }

  render() {
    if( this.props.match.params.id && parseInt(this.props.match.params.id, 10) !== this.props.recordFormStore.record.id ) {
      // fixme: show a spinner here whilst we load the record we're editing
      return <div className="spinner" />
    }else if( this.props.recordFormStore.record.id && !this.props.recordFormStore.record.user_can_edit_record ) {
      return <div className='m-overlay'>
        <div className="close">
          <a href="#" className="close" onClick={this.handleCloseOnClick.bind(this)}>Close</a>
        </div>

        <div className="m-add-record">
          <h1>Add record</h1>

          <p>
            You don't have permission to edit this record.
          </p>
        </div>
      </div>
    }

    let className = "m-overlay";
    if( this.props.mapViewStore.overlay === 'record_form' ) className+=" is-showing";

    let form_title = this.props.recordFormStore.record.id ? "Edit record" : "Add record";

    return (
      <div className={className}>
        <div className="s-overlay--add-record is-showing">
          <div className="close">
            <a href="#" className="close" onClick={this.handleCloseOnClick.bind(this)}>Close</a>
          </div>

          <div className="m-add-record">
            <h1>{form_title}</h1>

            <form action="" className="form--chunky form--over-white">
              <Dates   {...this.props} />
              <Details {...this.props} />
              <Credits {...this.props} />

              <div className="m-accordion">
                <Media {...this.props} />
                {/*<Links {...this.props} />*/}
                <CollectionsEditor {...this.props} />
                {/*<Team {...this.props} />*/}
              </div>

              <div className="form-actions">

                {/*

                If NEW:

                <div class="secondary-actions">
                  <button className="cancel">Cancel</button>
                </div>

                <div class="primary-actions">
                  <input type="submit" onClick={this.handleClickedOnSave.bind(this)} value="Save for later" />
                  <button className="publish">Publish</button>
                </div>

                If DRAFT:

                <div class="secondary-actions">
                  <button className="delete">Delete</button>
                </div>

                <div class="primary-actions">
                  <input type="submit" onClick={this.handleClickedOnSave.bind(this)} value="Save for later" />
                  <button className="publish">Publish</button>
                </div>

                If PUBLISHED:

                <div class="secondary-actions">
                  <button className="delete">Delete</button>
                  <button className="unpublish">Unpublish</button>
                </div>

                <div class="primary-actions">
                  <button className="publish">Publish</button>
                </div>

                */
                }

                <div className="primary-actions">
                  {this.props.recordFormStore.record.id && (
                    <button type="submit" className="btn-danger delete" onClick={this.handleClickedDelete.bind(this)}>
                      Delete
                    </button>
                  )}

                  <input type="submit" onClick={this.handleClickedOnSave.bind(this)} value="Save" />
                </div>

              </div>

            </form>
          </div>
        </div>
      </div>
    );
  }
}
