//主表單
var GirdForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:{rows:[],page:1},
			fieldData:{},
			searchData:{agent_id:null,name:null,area_id:null,tw_city:null,tw_country:null},
			edit_type:0,
			checkAll:false,
			grid_right_customer:[],
			grid_left_customer:[],
			option_agent:[],
			country_list:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Product'

		};
	},	
	componentDidMount:function(){

		this.queryAgent();
		//this.queryLeftProduct();
		//this.queryRightProduct();
	},
	handleSubmit: function(e) {

		e.preventDefault();
		if(this.state.edit_type==1){
			jqPost(this.props.apiPathName,this.state.fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					tosMessage(null,'新增完成',1);
					this.updateType(data.id);
				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}		
		else if(this.state.edit_type==2){
			jqPut(this.props.apiPathName,this.state.fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					tosMessage(null,'修改完成',1);
				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		};
		return;
	},
	queryLeftCustomer:function(){
			jqGet(gb_approot + 'api/GetAction/GetLeftCustomer',this.state.searchData)
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_left_customer:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},	
	queryRightCustomer:function(){
			jqGet(gb_approot + 'api/GetAction/GetRightCustomer',{agent_id:this.state.searchData.agent_id})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({grid_right_customer:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
	},
	queryAgent:function(){

			jqGet(gb_approot + 'api/GetAction/GetAllAgent',{})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({option_agent:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});		
	},
	queryChangeAgent:function(e){
		var obj = this.state.searchData;
		obj['agent_id'] = e.target.value;
		this.setState({searchData:obj});
		this.queryLeftCustomer();
		this.queryRightCustomer();
	},
	queryChangeCustomerParam:function(name,e){
		var obj = this.state.searchData;
		obj[name] = e.target.value;
		this.setState({searchData:obj});
		//經銷商為選取前,左邊的客戶資料不能顯示
		if(obj.agent_id!=null){
			this.queryLeftCustomer();			
		}
	},
	queryChangeCity:function(e){
		this.listCountry(e.target.value);
		var obj = this.state.searchData;
		obj['tw_city'] = e.target.value;
		this.setState({searchData:obj});
		//經銷商為選取前,左邊的客戶資料不能顯示
		if(obj.agent_id!=null){
			this.queryLeftCustomer();			
		}
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
	addCustomer:function(customer_id){
			jqPost(gb_approot + 'api/GetAction/PostMapAgentCustomer',{agent_id:this.state.searchData.agent_id,customer_id:customer_id})
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					this.queryLeftCustomer();
					this.queryRightCustomer();
				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});		
	},
	removeCustomer:function(customer_id){
			jqDelete(gb_approot + 'api/GetAction/DeleteMapAgentCustomer',{agent_id:this.state.searchData.agent_id,customer_id:customer_id})
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					this.queryLeftCustomer();
					this.queryRightCustomer();
				}else{
					alert(data.message);
				}

			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});	
	},
	insertType:function(){
		this.setState({edit_type:1,fieldData:{}});
	},
	updateType:function(id){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_type:2,fieldData:data.data});
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
	render: function() {
		var outHtml = null;
		var fieldData = {};
		var searchData=this.state.searchData;

		outHtml =(
			<div>
				<ul className="breadcrumb">
					<li><i className="fa-list-alt"></i> {this.props.MenuName}</li>
				</ul>
				<h3 className="title">
					{this.props.Caption}
				</h3>
				<div className="table-header">
					<div className="table-filter">
						<div className="form-inline">
							<div className="form-group">
								<label>選擇經銷商</label> { }
								<select className="form-control" 
										onChange={this.queryChangeAgent}
										value={searchData.agent_id}>
									<option value=""></option>
									{
										this.state.option_agent.map(function(itemData,i) {
											var out_sub_html =                     
													<option value={itemData.agent_id} key={itemData.agent_id}>{itemData.agent_name}</option>;
											return out_sub_html;
										}.bind(this))
									}
								</select>
							</div> { }
						</div>
					</div>
				</div>
				<div className="row">
					<div className="col-xs-6">
						<div className="table-responsive">
							<table className="table-condensed">
								<caption>
								    <div className="form-inline break pull-right">
				                        <div className="form-group">
				                            <input type="text" className="form-control input-sm" placeholder="店名/客編"
				                           	value={searchData.name} 
	                						onChange={this.queryChangeCustomerParam.bind(this,'name')} /> { }
				                            <select name="" id="" className="form-control input-sm"
				                            onChange={this.queryChangeCustomerParam.bind(this,'area_id')}
											value={searchData.area_id}> { }
				                                <option value="">區域群組</option>
											{
												CommData.AreasData.map(function(itemData,i) {
													return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
												})
											}
				                            </select> { }
				                            <select name="" id="" className="form-control input-sm"
				                       		onChange={this.queryChangeCity.bind(this)}
											value={searchData.tw_city}>
				                                <option value="">縣市</option>
												{
													CommData.twDistrict.map(function(itemData,i) {
														return <option key={itemData.city} value={itemData.city}>{itemData.city}</option>;
													})
												}
				                            </select> { }

											<select className="form-control input-sm" 
													value={searchData.tw_country}
													onChange={this.queryChangeCustomerParam.bind(this,'tw_country')}>
												<option value="">鄉鎮市區</option>
												{
													this.state.country_list.map(function(itemData,i) {
														return <option key={itemData.county} value={itemData.county}>{itemData.county}</option>;
													})
												}
											</select>

				                        </div>
				                    </div>
				                    所有客戶
								</caption>
								<tbody>
									<tr>
										<th>客戶名稱</th>
					                	<th className="text-center">加入</th>
									</tr>
									{
										this.state.grid_left_customer.map(function(itemData,i) {
											var out_sub_html =                     
												<tr key={itemData.customer_id}>
							                        <td>{itemData.customer_name}</td>
				                        			<td className="text-center">
														<button className="btn-link text-success" type="button" onClick={this.addCustomer.bind(this,itemData.customer_id)}>
															<i className="fa-plus"></i>
														</button>
							                        </td>
												</tr>;
											return out_sub_html;
										}.bind(this))
									}
								</tbody>
	        				</table>
	        			</div>
        			</div>
					<div className="col-xs-6">
						<div className="table-responsive">
							<table className="table-condensed">
								<caption>已對應客戶</caption>
								<tbody>
									<tr>
										<th>客戶名稱</th>
					                	<th className="text-center">刪除</th>
									</tr>
									{
										this.state.grid_right_customer.map(function(itemData,i) {
											var out_sub_html =                     
												<tr key={itemData.customer_id}>
							                        <td>{itemData.customer_name}</td>
				                        			<td className="text-center">
														<button className="btn-link text-danger" type="button" onClick={this.removeCustomer.bind(this,itemData.customer_id)}>
															<i className="fa-times"></i>
														</button>
							                        </td>
												</tr>;
											return out_sub_html;
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