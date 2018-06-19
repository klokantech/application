import React,{Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from "mobx-react";
import { Route } from 'react-router';
import {Link, withRouter} from 'react-router-dom';

import Tools from './tools';
import Tray from './tray';
import MapView from './map_view';
import SearchView from './search_view';
import RecordView from './record_view';
import CollectionView from './collection_view';
import PlacePicker from './place_picker';
import LayersOverlay from './layers_overlay';

import CollectionForm from './forms/collections/collection_form';
import UserForm from './forms/user/user_form';
import RecordForm from './forms/records/record_form';


@inject('routing', 'recordFormStore', 'trayViewStore', 'mapViewStore', 'collectionStore', 'layersStore')
@withRouter
@observer export default class Main extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let className = "m-map-wrapper";
    if( !this.props.trayViewStore.tray_is_visible ) {
      className += " tray-is-closed";
    }

    return <div className={className}>
      {/* permanantly visible components */}
      <Tools {...this.props} />
      <Tray {...this.props} />
      <MapView {...this.props} />

      {/* Various Overlays ... */}
      <Route exact path='/map/account' component={UserForm} />
      <Route exact path='/map/account/:tab' component={UserForm} />
      <Route path='/map/layers' component={LayersOverlay} />
      <Route path='/map/search' component={SearchView} />

      {/* show the collections form */}
      <Route exact path='/map/collections/new' component={CollectionForm} />
      <Route exact path='/map/collections/:id/edit' component={CollectionForm} />

      {/* the route we go to when '+ Add record' is clicked to allow the user to choose a place */}
      <Route path='/map/records/choose-place' component={PlacePicker} />
      {/* once the user has chosen a place on the map, we show the form */}
      <Route path='/map/records/new' component={RecordForm} />

      {/* edit an existing record */}
      <Route exact path='/map/records/:id/edit' component={RecordForm} />
      <Route exact path='/map/collections/:collection_id/records/:id/edit' component={RecordForm} />

      {/* view a record */}
      <Route exact path='/map/records/:id' component={RecordView} />

      {/* view a collection */}
      <Route exact path='/map/collections/:id' component={CollectionView} />

      {/* view a record within a collection */}
      <Route exact path='/map/collections/:collection_id/records/:id' component={RecordView} />
    </div>
  }
}
