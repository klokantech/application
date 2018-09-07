import React,{Component,Fragment} from 'react';
import RecordFormComponentState from './record_form_component_state';
import PlaceDetails from './place_details';
import {observe} from 'mobx';
import {observer} from 'mobx-react';
import ReactQuill from 'react-quill';

@observer class Details extends Component {
  constructor(props) {
    super(props);

    this.state = {title: '', description: this.props.recordFormStore.record.description};
  }

  handleDescriptionChange(value) {
    this.setState({description: value});
    this.props.recordFormStore.record.description = value;
  }

  removeAutogeneratedTitle(event) {
    if (this.props.recordFormStore.record.has_autogenerated_title) {
      this.setState({title: ""});
      this.props.recordFormStore.record.title = "";
    }
  }

  componentWillMount() {
    // the component is mounted before the record is loaded from the api; a new record is created with the results of the GET request
    // so we need to observe the record itself and update the description if necessary.
    this.observerDisposer = observe(this.props.recordFormStore, 'record', (changes) => {
      if (changes.newValue) {
        this.setState({description: changes.newValue.description})
      }
    })
  }

  componentWillUnmount() {
    this.observerDisposer();
  }


  render() {
    let description = this.props.recordFormStore.record.description;
    // if(description.length) {
    //   description = description.map((el) => el.props.children).join("\n").replace(/^\n/,'');
    // }else {
    //   console.log(description);
    // }

    const modules = {
      toolbar: [
        [{'header': [1, 2, false]}],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        // ['link', 'image'],
        ['clean']
      ]
    };

    const formats = [
      'header',
      'bold', 'italic', 'underline', 'strike', 'blockquote',
      'list', 'bullet', 'indent',
      'link', 'image'
    ];

    const titleLabelClassName = !!this.props.recordFormStore.record.errors_on_publishing['title'] ? "errors-on-publish" : "";
    const descriptionLabelClassName = !!this.props.recordFormStore.record.errors_on_publishing['description'] ? "errors-on-publish" : "";


    return (


      
      <Fragment>
        <div className="form-group form-group--title">
          <label className={titleLabelClassName}>Title</label>
          <input type="text" name="title" value={this.props.recordFormStore.record.title} onChange={this.handleOnChange} onBlur={this.handleOnBlur} onFocus={this.removeAutogeneratedTitle.bind(this)} className={`${this.appendErrorClassNameToField('title')}`} />
        </div>

        <PlaceDetails {...this.props} />

        <div className="form-group form-group--description">
          <label className={descriptionLabelClassName}>Description</label>
          <ReactQuill theme="snow" modules={modules} formats={formats} value={this.state.description} onChange={this.handleDescriptionChange.bind(this)} onBlur={this.handleOnBlur} className={`${this.appendErrorClassNameToField('description')}`} />
          {/*<textarea rows="10" placeholder="" name="description" value={description} onChange={this.handleOnChange} className={`${this.appendErrorClassNameToField('description')}`}>*/}
          {/*</textarea>*/}
        </div>
      </Fragment>
    );
  }
}

export default RecordFormComponentState.bindComponent(Details);
