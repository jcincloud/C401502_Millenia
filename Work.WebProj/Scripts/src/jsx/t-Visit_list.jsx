//主表單
var GirdForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:[],
			fieldData:{},
			searchData:{title:null},
			edit_type:0,
			checkAll:false,
			show_insert_message:false,
			gridVisited:[],
			country_list:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Customer'

		};
	},	
	componentDidMount:function(){

		$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
			//id: tabAddNew tabAddView
			//console.log(e.target.id);
			if(e.target.id=='tabAddView'){
				this.setState({show_insert_message:false});
				this.queryTodayCustomer();
			}
		}.bind(this));

		this.setState({edit_type:1});
		this.queryWillVisit();
		this.queryDidVisit();
	},

	handleSubmit: function(e) {

		e.preventDefault();
		return;
	},
	handleSearch:function(e){
		e.preventDefault();
		this.queryGridData(0);
		return;
	},
	insertType:function(){
		this.setState({edit_type:1,fieldData:{}});
	},
	updateType:function(id){
		console.log(id);
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {

			data.data['birthday_1'] = moment(data.data['birthday_1']).format('YYYY-MM-DD');
			data.data['birthday_2'] = moment(data.data['birthday_2']).format('YYYY-MM-DD');

			this.setState({edit_type:2,fieldData:data.data});
			$('#tabAddNew').tab('show');
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	noneType:function(){
		this.gridData(0)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_type:0,gridData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	changeFDValue:function(name,e){
		this.setInputValue(this.props.fdName,name,e);
	},
	changeGDValue:function(name,e){
		this.setInputValue(this.props.gdName,name,e);
	},
	setFDValue:function(fieldName,value){
		//此function提供給次元件調用，所以要以屬性往下傳。
		var obj = this.state[this.props.fdName];
		obj[fieldName] = value;
		this.setState({fieldData:obj});
	},
	setInputValue:function(collentName,name,e){

		var obj = this.state[collentName];
		if(e.target.value=='true'){
			obj[name] = true;
		}else if(e.target.value=='false'){
			obj[name] = false;
		}else{
			obj[name] = e.target.value;
		}
		this.setState({fieldData:obj});
	},
	queryWillVisit:function(){
		jqGet(gb_approot+'api/GetAction/GetMyWillVisit',{})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	queryDidVisit:function(){
		jqGet(gb_approot+'api/GetAction/GetMyDidVisit',{})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridVisited:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	startVisit:function(visit_detail_id){
		jqPut(gb_approot + 'api/GetAction/startVisitCustomer',{visit_detail_id:visit_detail_id})
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				document.location.href = gb_approot + 'Active/Tablet/Visit_content?visit_detail_id=' + visit_detail_id;
			}
			else{
				alert(data.message);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	setViewVisit:function(visit_detail_id){
		document.location.href = gb_approot + 'Active/Tablet/VisitView?visit_detail_id=' + visit_detail_id;
	},	
	onCityChange:function(e){

		this.listCountry(e.target.value);
		var obj = this.state.searchData;
		obj['city'] = e.target.value;
		this.setState({searchData:obj});
	},
	onCountryChange:function(e){
		var obj = this.state.searchData;
		obj['country'] = e.target.value;
		this.setState({searchData:obj});
	},
	listCountry:function(value){
		for(var i in CommData.twDistrict){
			var item = CommData.twDistrict[i];
			if(item.city==value){
				this.setState({country_list:item.contain});
				break;
			}
		}
	},

	render: function() {
		var outHtml = null;
		var fieldData = this.state.fieldData;

		outHtml=(
		<div role="tabpanel">
		    <ul className="nav nav-tabs" role="tablist">
		        <li role="presentation" className="active">
		            <a href="#visit" aria-controls="home" role="tab" data-toggle="tab">
		                <i className="glyphicon glyphicon-th-list"></i> 預計拜訪名單
		            </a>
		        </li>
		        <li role="presentation">
		            <a href="#visited" aria-controls="profile" role="tab" data-toggle="tab">
		                <i className="glyphicon glyphicon-ok"></i> 已拜訪名單
		            </a>
		        </li>
		    </ul>

		    <div className="tab-content">
		        <div role="tabpanel" className="tab-pane active" id="visit">
		            <form action="" className="table-form form-inline">
		            </form>
		            <div className="table-responsive">
		                <table className="table table-bordered table-striped table-condensed">
		                	<tbody>
			                    <tr>
			                        <th>店名</th>
			                        <th>縣市</th>
			                        <th>鄉鎮市</th>
			                        <th>地址</th>
			                        <th>拜訪狀態</th>
			                        <th>系統狀態</th>
			                    </tr>
								{
									this.state.gridData.map(function(itemData,i) {
										var out_html =                     
											<tr key={itemData.visit_detail_id}>
						                        <td>{itemData.customer_name}</td>
						                        <td>{itemData.tw_city}</td>
						                        <td>{itemData.tw_country}</td>
						                        <td>{itemData.tw_address}</td>
												<td><StateForGrid stateData={CommData.VisitDetailState} id={itemData.state} /></td>
			                        			<td>
													<button className="btn btn-success btn-sm" type="button" onClick={this.startVisit.bind(this,itemData.visit_detail_id)}>
														按此開始拜訪 { }
														<i className="glyphicon glyphicon-arrow-right"></i>
													</button>
						                        </td>
											</tr>;
										return out_html;
									}.bind(this))
								}
							</tbody>
		                </table>
		            </div>
		        </div>
		        <div role="tabpanel" className="tab-pane" id="visited">
		            <form action="" className="table-form form-inline">
		            </form>
		            <div className="table-responsive">
		                <table className="table table-bordered table-striped table-condensed">
		                	<tbody>
			                    <tr>
			                        <th className="text-center">檢視</th>
			                        <th>店名</th>
			                        <th>縣市</th>
			                        <th>鄉鎮市</th>
			                        <th>地址</th>
			                        <th>拜訪狀態</th>
			                    </tr>
								{
									this.state.gridVisited.map(function(itemData,i) {
										var out_html =                     
					                    <tr key={itemData.visit_detail_id}>
					                        <td className="text-center">
					                        	<button className="btn btn-link" onClick={this.setViewVisit.bind(this,itemData.visit_detail_id)}>
					                        		<i className="glyphicon glyphicon-search"></i>
					                        	</button>
					                        </td>
					                        <td>{itemData.customer_name}</td>
					                        <td>{itemData.tw_city}</td>
					                        <td>{itemData.tw_country}</td>
					                        <td>{itemData.tw_address}</td>
					                        <td><StateForGrid stateData={CommData.VisitDetailState} id={itemData.state} /></td>
					                    </tr>;
										return out_html;
									}.bind(this))
								}
		                    </tbody>
		                </table>
		            </div>
		        </div>
		    </div>
		</div>
		);
		return outHtml;
	}
});