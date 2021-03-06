import React,{Component} from 'react';
import {observer} from "mobx-react";
import {Link} from 'react-router-dom';
import RecordViewComponentState from './record_view_component_state';
import Img from 'react-image';

@observer class RecordViewMediaListItem extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    /*
  <div className="media-item media-item--image">
          <Link to={`/map/records/${this.props.match.params.id}/media/1/image`}>
            <img src={require('../assets/images/example/1-large.jpg')} alt=""/>
            <div className="attribution">
              <p>Duis dapibus mollis erat ac.</p>
            </div>
            <div className="caption">
              <p>Proin ornare sapien in nunc fermentum euismod. Sed lectus purus, ornare vel faucibus volutpat, pharetra vitae nisl. Nunc metus neque, dictum sit amet risus eget, porttitor tincidunt purus. Fusce ultricies est sed vulputate fermentum. Nunc vel tristique orci. Proin dapibus.</p>
            </div>
          </Link>
  </div>
    gallery_class += this.props.record.view_type === 'expanded' ? 'm-media-viewer--expanded' : 'm-media-viewer--gallery';
   */

    // console.log(this.props.media.url);

    const image_attribute = this.props.record.view_type === 'gallery' ? 'card' : 'large';

    return <div className={`media-item media-item--${this.props.media.media_type}`}>
      <Link to={`${this.props.record.id}/media/${this.props.media.id}`}>
        <Img src={this.props.media.attachable[image_attribute]} alt="" loader={<span className="is-loading" /> }/>
        {this.props.record.view_type === 'expanded' && <div className="attribution" dangerouslySetInnerHTML={{__html: this.props.media.attribution}}></div>}
        {this.props.record.view_type === 'expanded' && <div className="caption" dangerouslySetInnerHTML={{__html: this.props.media.caption}}></div>}
      </Link>
    </div>
  }
}

export default RecordViewComponentState.bindComponent(RecordViewMediaListItem);
