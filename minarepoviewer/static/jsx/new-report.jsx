var BOSHSERVICE = 'http://133.27.171.93/http-bind/';
var XMPPSERVER = 'soxfujisawa.ht.sfc.keio.ac.jp';
var client;

var reportMap = null;
var reportValues = {
  user: null,
  latitude: null,
  longitude: null,
  comment: '',
  image: '',
  level: 0
};

var INIT_MAP_CENTER = {
  lat: 35.339193,  // 藤沢市役所(緯度)
  lng: 139.490016  // 藤沢市役所(経度)
}
var SFC = {
  lat: 35.388281,  // SFC緯度
  lng: 139.427309  // SFC経度
}

var reportTypes = [
  'ps_animal',         // 動物
  'ps_illegalGarbage', // 不法投棄
  'ps_garbageStation', // 集積所
  'ps_graffiti',       // 落書き
  'ps_damage',         // 道路
  'ps_streetlight',    // 街灯
  'ps_kyun',           // キュン
  'ps_disaster',       // 災害
  'ps_zansa',          // 残渣
  'ps_forgetGarbage',  // 回収忘れ
  'ps_others',          // その他
  'ps_recycleStation'  // 資源集積所
];

var type2text = {
  'ps_animal': '動物の死骸',
  'ps_illegalGarbage': '不法投棄ごみ',
  'ps_garbageStation': '回収されていないゴミ',
  'ps_graffiti': '落書き',
  'ps_damage': '痛んだ道路',
  'ps_streetlight': '問題のある街灯',
  'ps_kyun': 'キュン',
  'ps_disaster': '災害の発生',
  'ps_zansa': '残渣',
  'ps_forgetGarbage': 'ゴミの回収し忘れ',
  'ps_others': 'その他',
  'ps_recycleStation': '資源集積所'
};

var type2textShort = {
  'ps_animal': '動物',
  'ps_illegalGarbage': '投棄',
  'ps_garbageStation': 'ゴミ置場',
  'ps_graffiti': '落書',
  'ps_damage': '道路',
  'ps_streetlight': '街灯',
  'ps_kyun': '♡♡',
  'ps_disaster': '災害',
  'ps_zansa': '残渣',
  'ps_forgetGarbage': '拾い忘れ',
  'ps_others': '他',
  'ps_recycleStation': '資源'
};

var level2text = [
  '対応必要なし',
  '対応必要(通知なし)',
  '緊急(通知あり)'
]

var type2img = function(type, isSelected) {
  var suffix = (isSelected) ? '' : '-unselected';
  return '/static/img/minarepo-icons/' + type + suffix +'.png';
};

var publishReport = function(type) {
  client = new SoxClient(BOSHSERVICE, XMPPSERVER);

  var soxEventListener = new SoxEventListener();
  soxEventListener.connected = function(soxEvent) {
    console.debug('Connected!' + soxEvent);
    var device = new Device(type);

    for (key in reportValues) {
      var transducer = new Transducer();
      transducer.name = key;
      transducer.id = key;
      device.addTransducer(transducer);

      var data = new SensorData(key, new Date(), reportValues[key], reportValues[key]);
      transducer.setSensorData(data);
    }

    client.publishDevice(device);
  };
  soxEventListener.connectionFailed = function(soxEvent) {
    var toastMsg = '<div class="toast-msg">\
      <p>サーバに接続できませんでした．ページを再読み込みしてください</p>\
    </div>';
    showToast('Error', toastMsg, '2500');
    console.debug('Connection Failed' + soxEvent);
  };
  soxEventListener.resolved = function(soxEvent) {
    console.debug('Resolved' + soxEvent);
  };
  soxEventListener.resolveFailed = function(soxEvent) {
    console.debug('Resolve Failed' + soxEvent);
  };
  soxEventListener.published = function(soxEvent) {
    $.toast({
      hideAfter: '1500',
      heading: 'Success',
      icon: 'success',
      text: '<p class="toast-msg">送信しました</p>',
      allowToastClose: true,
      position: 'mid-center',
      loader: false,
      afterHidden: function() {
        window.location.href = "/";
      }
    });
    console.debug('Published' + soxEvent);
    client.disconnect();
    console.debug('Published: going to disconnect');
  };
  soxEventListener.publishFailed = function(soxEvent) {
    var toastMsg = '<div class="toast-msg">\
      <p>送信できませんでした．しばらく経ってから再度お試しください</p>\
    </div>';
    showToast('Error', toastMsg, '3000');
    console.debug('Publish Failed' + soxEvent);
  };
  soxEventListener.disconnected = function(soxEvent) {
    console.debug('sox disconnected');
    client = null;
    console.debug('sox disconnected: set client null');
  };

  client.setSoxEventListener(soxEventListener);
  client.connect();
  //hoge
};

// var postReport = function(type) {
//   reportValues['type'] = type;
//   $.ajax({
//     type: 'POST',
//     url: '/post/new_report',
//     data: reportValues,
//     dataType: 'json',
//     success: function(data) {
//       $.toast({
//         hideAfter: '1500',
//         heading: 'Success',
//         icon: 'success',
//         text: '<p class="toast-msg">送信しました</p>',
//         allowToastClose: true,
//         position: 'mid-center',
//         loader: false,
//         afterHidden: function() {
//           window.location.href = "/";
//         }
//       });
//     },
//     error: function() {
//       var toastMsg = '<div class="toast-msg">\
//         <p>送信できませんでした．しばらく経ってから再度お試しください</p>\
//       </div>';
//       showToast('Error', toastMsg, '3000');
//     }
//   });
// }

var showToast = function(type, msg, msec) {
  $.toast({
    heading: type,
    icon: type.toLowerCase(),
    text: msg,
    hideAfter: msec,
    allowToastClose: true,
    position: 'mid-center',
    loader: false
  });
  return;
};

var constants = {
  TOGGLE_VIEWER_PAGE_BUTTON: 'TOGGLE_VIEWER_PAGE_BUTTON',
  TOGGLE_TYPE_BUTTON: 'TOGGLE_TYPE_BUTTON',
  TOGGLE_PUBLISH_BUTTON: 'TOGGLE_PUBLISH_BUTTON',
  TOGGLE_POST_BUTTON: 'TOGGLE_POST_BUTTON',
  TOGGLE_LEVEL_BUTTON: 'TOGGLE_LEVEL_BUTTON'
};

var MinaRepoStore = Fluxxor.createStore({
  initialize: function() {
    this.selectedType = '';
    this.selectedLevel = 0;

    this.bindActions(constants.TOGGLE_VIEWER_PAGE_BUTTON, this.onToggleViewerPageButton);
    this.bindActions(constants.TOGGLE_TYPE_BUTTON, this.onToggleTypeButton);
    this.bindActions(constants.TOGGLE_PUBLISH_BUTTON, this.onTogglePublishButton);
    this.bindActions(constants.TOGGLE_POST_BUTTON, this.onTogglePostButton);
    this.bindActions(constants.TOGGLE_LEVEL_BUTTON, this.onToggleLevelButton);
  },
  getState: function() {
    return {
      selectedType: this.selectedType,
      selectedLevel: this.selectedLevel
    }
  },
  onToggleViewerPageButton: function(data) {
    return;
  },
  onToggleTypeButton: function(data) {
    this.selectedType = data.type;
    reportValues.type = this.selectedType;
    this.emit('change');
  },
  onTogglePublishButton: function() {
    var rName = reportValues.user;
    var rLat = reportValues.latitude;
    var rLng = reportValues.longitude;

    if (!rName || !rLat || !rLng) {
      var toastMsg = '<p class="toast-msg">未記入の項目があります</p>';
      showToast('Error', toastMsg, '2500');
      return;
    }
    publishReport(this.selectedType);
    this.emit('change');
  },
  onTogglePostButton: function() {
    var rName = reportValues.user;
    var rLat = reportValues.latitude;
    var rLng = reportValues.longitude;
    var rLevel = reportValues.level;

    if (!rName || !rLat || !rLng) {
      var toastMsg = '<p class="toast-msg">未記入の項目があります</p>';
      showToast('Error', toastMsg, '2500');
      return;
    }
    // postReport(this.selectedType);
    this.emit('change');
  },
  onToggleLevelButton: function(data) {
    this.selectedLevel = data.level;
    reportValues.level = this.selectedLevel;
    this.emit('change');
  }
});

var actions = {
  onToggleViewerPageButton: function() {
    window.location.href = "/";
  },
  onToggleTypeButton: function(data) {
    this.dispatch(constants.TOGGLE_TYPE_BUTTON, {type: data.type});
  },
  onTogglePublishButton: function() {
    this.dispatch(constants.TOGGLE_PUBLISH_BUTTON);
  },
  onTogglePostButton: function() {
    this.dispatch(constants.TOGGLE_POST_BUTTON);
  },
  onToggleLevelButton: function(data) {
    this.dispatch(constants.TOGGLE_LEVEL_BUTTON, {level: data.level});
  }
};

var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var stores = { MinaRepoStore: new MinaRepoStore() };
var flux = new Fluxxor.Flux(stores, actions);

var User = React.createClass({
  onChangeName: function(text) {
    reportValues.user = text.target.value;
  },
  render: function() {
    var descRow = <div className="row">
      <div className="small-10 small-centered columns">
        <p>(1) 報告者名を登録してください [<font color="red">必須</font>]</p>
      </div>
    </div>;
    var inputRow = <div className="row">
      <div className="small-6 small-centered columns">
        <input type="text" onChange={this.onChangeName} />
      </div>
    </div>;

    return <div>
      {descRow}
      {inputRow}
    </div>;
  }
});

var TypeButtons = React.createClass({
  onButtonClick: function(type) {
    return function(event) {
      flux.actions.onToggleTypeButton({ type: type });
    };
  },
  render: function() {
    var selectedBtn = this.props.selectedType;

    var that = this;
    var buttons = _.map(reportTypes, function(type) {
      var shortTxtType = type2textShort[type]
      var isSelected = (selectedBtn == type);
      var imgFile = type2img(type, isSelected);
      var key = type + '-' + (isSelected ? 'selected' : 'unselected');  // React wants key!
      return <div key={key} className="column mrv-btn-container">
        <p className="btn-set"><img
          onClick={that.onButtonClick(type)}
          src={imgFile}
          className="mrv-btn-image"
        />{shortTxtType}</p>
      </div>;
    });

    var descRow = <div className="row">
      <div className="small-10 small-centered columns">
        <p>(2) レポート種類を選んでください [<font color="red">必須</font>]</p>
      </div>
    </div>;
    var buttonRow = <div className="row mrv-btn-row">
      <div className="small-10 medium-8 small-centered columns">
        <div className="row small-up-4 large-up-7">
          {buttons}
        </div>
      </div>
    </div>;

    return <div>
      {descRow}
      {buttonRow}
    </div>;
  }
});

var ReportMap = React.createClass({
  componentDidMount: function() {
    // GoogleMaps初期化

    // FIXME: センターの位置をスマートフォンのGPSから取得する？
    // var sfcLatitude = 35.388281;
    // var sfcLongitude = 139.427309;
    reportMap = new google.maps.Map(document.getElementById('report-map'), {
        center: INIT_MAP_CENTER,
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: false
      }
    );

    var marker = new google.maps.Marker({
        position: null,
        map: reportMap,
        title: 'レポート地点'
    });

    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    reportMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    reportMap.addListener('bounds_changed', function() {
        searchBox.setBounds(reportMap.getBounds());
    });
    searchBox.addListener('places_changed', function() {
      var places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // Clear out the old markers.
      marker.setMap(null);

      var bounds = new google.maps.LatLngBounds();
      marker = new google.maps.Marker({
        map: reportMap,
        title: places[0].name,
        position: places[0].geometry.location
      });
      reportMap.fitBounds(bounds);
      reportMap.panTo(places[0].geometry.location);
      reportMap.setZoom(15);

      reportValues.latitude = places[0].geometry.location.lat();
      reportValues.longitude = places[0].geometry.location.lng();
    });

    google.maps.event.addListener(reportMap, 'click', function(e) {
      var clickedLat = e.latLng.lat();
      var clickedLng = e.latLng.lng();
      var clickedPosition = {lat: clickedLat, lng: clickedLng};
      reportValues.latitude = clickedLat;
      reportValues.longitude = clickedLng;

      reportMap.panTo(clickedPosition);
      marker.setMap(null);
      marker = new google.maps.Marker({
        position: clickedPosition,
        map: reportMap,
        title: 'レポート地点'
      });
    });

    var set = google.maps.InfoWindow.prototype.set;
    google.maps.InfoWindow.prototype.set = function(key, val) {
        if (key === 'map') {
            if (! this.get('noSuppress')) {
                return;
            }
        }
        set.apply(this, arguments);
    };
  },
  render: function() {
    var descRow = <div className="row">
      <div className="small-10 small-centered columns">
        <p>(3) 場所を指定してください [<font color="red">必須</font>]</p>
      </div>
    </div>;
    var mapRow = <div className="row">
      <div className="small-12 medium-8 small-centered columns">
        <input id="pac-input" className="controls small-2" type="text" placeholder="検索"/>
        <div id="report-map" key="report-map"></div>
      </div>
    </div>;

    return <div>
      {descRow}
      {mapRow}
    </div>;
  }
});

var ReportLevel = React.createClass({
  onLevelSelected: function(level) {
    return function(event) {
      flux.actions.onToggleLevelButton({ level: level });
    };
  },
  render: function() {
    var selectedLevel = this.props.selectedLevel;

    var descRow = <div className="row">
      <div className="small-10 small-centered columns">
        <p>(4) 対応レベルを選択してください [<font color="blue">任意</font>]</p>
      </div>
    </div>;

    var radioButtonRow = <div className="row mrv-btn-row">
      <div className="small-11 small-centered columns text-center">
      <label>
        <input type="radio" name="level" value="0" onChange={this.onLevelSelected(0)} checked={selectedLevel === 0} />
        {level2text[0]}
      </label>
      <label>
        <input type="radio" name="level" value="1" onChange={this.onLevelSelected(1)} checked={selectedLevel === 1} />
        {level2text[1]}
      </label>
      <label>
        <input type="radio" name="level" value="2" onChange={this.onLevelSelected(2)} checked={selectedLevel === 2} />
        {level2text[2]}
      </label>
      </div>
    </div>;

    return <div>
      {descRow}
      {radioButtonRow}
    </div>;
  }
});

var ReportComment = React.createClass({
  onChangeComment: function(text) {
    reportValues.comment = text.target.value;
  },
  render: function() {
    var descRow = <div className="row">
      <div className="small-10 small-centered columns">
        <p>(5) コメントを記入してください [<font color="blue">任意</font>]</p>
      </div>
    </div>;
    var commentRow = <div className="row">
      <div className="medium-8 medium-centered columns">
        <textarea onChange={this.onChangeComment} />
      </div>
    </div>;

    return <div>
      {descRow}
      {commentRow}
    </div>;
  }
});

var ReportImage = React.createClass({
  onUploadImage: function(img) {
    var imgfiles = img.target.files;
    if(!imgfiles.length) {
      return;
    }

    var reportImage = imgfiles[0];
    var options = {canvas: true};
    loadImage.parseMetaData(reportImage, function(data) {
      if (data.exif) {
        options.orientation = data.exif.get('Orientation');
      }
      options.maxHeight = 550;
      options.maxWidth = 550;
    });
    loadImage(
      reportImage,
      function(canvas) {
        reportValues.image = canvas.toDataURL('image/png');
      },
      options
    );
  },
  render: function() {
    return <div className="row">
      <div className="small-10 small-centered columns">
        <p>
          (6) 画像を登録してください [<font color="blue">任意</font>]:
          <input className="short-size" type="file" onChange={this.onUploadImage} accept="image/*" />
        </p>
      </div>
    </div>
  }
});

var PublishButton = React.createClass({
  componentDidMount: function() {
  },
  onButtonClick: function() {
    return function(event) {
      flux.actions.onTogglePublishButton();
      // flux.actions.onTogglePostButton();
    };
  },
  render: function() {
    var togglePublishButton = <div className="large-2 large-centered columns">
      <button className="button expanded large" onClick={this.onButtonClick()}>
        送信
      </button>
    </div>;

    return <div className="row">
      {togglePublishButton}
    </div>;
  }
});

var ViewerPageButton = React.createClass({
  onToggleViewerPageButton: function() {
    return function() {
      flux.actions.onToggleViewerPageButton();
    }
  },
  render: function() {
     return <div className="row">
       <div className="small-10 small-centered columns mrv-btn-row">
         <a onClick={this.onToggleViewerPageButton()}>&lt;&lt; 藤沢みなレポへ</a>
       </div>
     </div>;
  }
});

var MinaRepoViewer = React.createClass({
  render: function() {
    var header = <div className="row">
      <div className="large-12 columns mrv-title-container">
        <a href="/">
          <img src="/static/img/minarepo-title.png" className="mrv-title-image" />
        </a>
      </div>
    </div>;

    var viewerPageButton = <ViewerPageButton/>;

    var user = <User/>;
    var buttons = <TypeButtons
      selectedType={this.props.selectedType}
    />;
    var reportMap = <ReportMap/>;
    var reportComment = <ReportComment/>;
    var reportImage = <ReportImage/>;
    var reportLevel = <ReportLevel
      selectedLevel={this.props.selectedLevel}
    />;
    var publishButton = <PublishButton/>;

    var footer = <div className="row">
      <div className="large-12 columns mrv-footer">
        Powered by <a href="https://www.city.fujisawa.kanagawa.jp/">藤沢市</a> and <a href="https://www.ht.sfc.keio.ac.jp/">htlab</a>
        <br/><br/>
      </div>
    </div>;

    return <div>
      {header}
      <hr/>
      {viewerPageButton}
      {user}
      {buttons}
      {reportMap}
      {reportLevel}
      {reportComment}
      {reportImage}
      {publishButton}
      <hr/>
      {footer}
    </div>;
  }
});

var MinaRepoViewerApp = React.createClass({
  mixins: [ FluxMixin, StoreWatchMixin('MinaRepoStore') ],
  getStateFromFlux: function() {
    return this.getFlux().store('MinaRepoStore').getState();
  },
  componentDidMount: function() {
    console.debug('!!!! MinaRepoViewerApp.componentDidMount');
  },
  render: function() {
    var s = this.state;
    return <MinaRepoViewer
      selectedType={s.selectedType}
      selectedLevel={s.selectedLevel}
    />;
  }
});

var main  = function() {
  ReactDOM.render(
    <MinaRepoViewerApp flux={flux} />,
    document.getElementById('minarepo-viewer-app')
  );

  $(document).foundation();
};

$(main);
