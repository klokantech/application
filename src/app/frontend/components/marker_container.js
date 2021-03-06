import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {inject, observer} from "mobx-react";
import { Marker, Popup } from 'react-leaflet'
import {Link, withRouter} from 'react-router-dom';
import Img from 'react-image';

import {Leaflet} from 'react-leaflet';
import L from 'leaflet';
import Parser from 'html-react-parser';
@inject('router')
@withRouter
@observer export default class MarkerContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {marker_hovered: false};
  }

  handleOnClick(event) {
    event.preventDefault();
    this.props.history.push(`/map/records/${this.props.record.id}`);
  }

  toggleHighlightCard() {
    this.props.cardComponent.highlighted_by_marker = !this.props.cardComponent.highlighted_by_marker;
    this.setState({marker_hovered: this.props.cardComponent.highlighted_by_marker});
  }

  render() {
    const default_icon = new L.Icon({
      iconUrl: require('../assets/images/record-marker.png'),
      iconRetinaUrl: require('../assets/images/record-marker@2x.png'),

      iconSize: [30, 40],
      shadowSize: [0, 0],
      iconAnchor: [15, 20],
      popupAnchor: [0, -33]
    });

    const highlighted_icon = new L.Icon({
      iconUrl: require('../assets/images/record-marker-highlighted.png'),
      iconRetinaUrl: require('../assets/images/record-marker-highlighted@2x.png'),

      iconSize: [30, 40],
      shadowSize: [0, 0],
      iconAnchor: [15, 20],
      popupAnchor: [0, 0]
    });

    /*TODO: Use this icon for users records*/
    const user_icon = new L.Icon({
        iconUrl: require('../assets/images/record-marker-user.png'),
        iconRetinaUrl: require('../assets/images/record-marker-user@2x.png'),

        iconSize: [30, 40],
        shadowSize: [0, 0],
        iconAnchor: [15, 20],
        popupAnchor: [0, 0]
    });

    let icon = default_icon;
    if(this.props.cardComponent.highlighted || this.state.marker_hovered) {
      icon = highlighted_icon;
    }

    return <Marker position={this.props.position} icon={icon}>

      <Popup>

        <div className="m-map-popover" onClick={this.handleOnClick.bind(this)}>
          <div className={`m-record-card ${this.props.record.placeholder_class}`}>
            <div className="wrapper">
                {this.props.record.image &&
                <div className="image">
                  <Img src={this.props.record.image.marker} loader={<span className="is-loading"></span>} />
                </div>
                }

              <div className="text-content">
                <h1>{this.props.record.title}</h1>
                <p>Curabitur eget feugiat odio. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc feugiat porttitor sapien. Donec luctus.</p>
              </div>
            </div>
          </div>
        </div>

      </Popup>
    </Marker>;
  }
}

MarkerContainer.propTypes = {
  record: PropTypes.object.isRequired
};
