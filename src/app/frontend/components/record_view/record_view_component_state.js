import React from 'react';

export default class RecordViewComponentState {
  static bindComponent(component) {
    const boundClass = class extends component {
      constructor(props) {
        super(props);

        this.state = Object.assign({}, this.state);

        this.handleCloseOnClick = this.handleCloseOnClick.bind(this);
      }

      handleCloseOnClick(event) {
        event.preventDefault();

        console.log("Close");
        // if(this.props.router.history.length>1) {
        //   this.props.router.history.goBack();
        // }else {
        //   this.props.router.push("/map");
        // }

        this.props.trayViewStore.record_id = false;
        this.props.trayViewStore.record = false;
        this.props.router.push("/map");
      }

      render() {
        return super.render();
      }
    };

    boundClass.displayName = component.name;
    return boundClass;
  }
}
