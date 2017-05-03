class CollectionControl extends React.Component {
  constructor(props) {
    super(props);
    this.state = props;

    this.collectionsStateChanged = this.collectionsStateChanged.bind(this);
  }

  setSearchQuery(event) {
    MapPinActions.setFormAttribute({collection_id: null});
    MapPinActions.setFormAttribute({collection_name: event.target.value});

    CollectionsStateActions.searchCollections(event.target.value);
  }

  componentDidMount() {
    CollectionsStateStore.listen(this.collectionsStateChanged);
  }

  collectionsStateChanged(state) {
    // let new_state = _.merge({},state,MapPinStore.getState());
    console.log(MapPinStore.getState(), state.collections);
    setTimeout(() => {
      MapPinActions.setFormAttribute({collections: state.collections});
    }, 100);
  }

  render() {
    let field = [];

    if(this.state.collection_id != null) {
      let item = this.state.collections.find((item) => {
        return item.id == this.state.collection_id;
      });

      field = <CollectionItem key={item.id} collection_item={item} />;
    }else if(this.state.collections.length==0 && this.state.collection_name.length>0) {
      field = <CollectionItemForm query={this.query} />
    }else {
      field = this.state.collections.map((item) => {
        return (<CollectionItem key={item.id} collection_item={item} />);
      });
    }

    return (
        <div className="form-group">
            <label>Add to collection</label>

            <input type="text" placeholder="Collection Name" onChange={this.setSearchQuery.bind(this)} />

            <div className="collection-item-options">
              {field}
            </div>
        </div>
    );
  }
}

CollectionControl = Layers.bindComponentToMapPinStore(CollectionControl);