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
			is_SetVisit:false,
			error_data:[]
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
	},
	handleSubmit: function(e) {

		e.preventDefault();

			if(this.state.fieldData['tel']!=undefined && this.state.fieldData['tel']!=''){
		   		if(this.state.fieldData['tel'].indexOf('-')!=-1 || this.state.fieldData['tel'].indexOf(' ')!=-1 ||
		   			this.state.fieldData['tel'].indexOf('　')!=-1){
		   			alert('電話請勿輸入「空白」或「-」！！');
		   			return;
		   		}
		   		if(this.state.fieldData['tel'].charAt(0)!=0){
		   			alert('電話前面請輸入區域號碼！！');
		   			return;
		   		}

		   }

		   	if(this.state.fieldData['area_id'] == undefined){
				tosMessage(gb_title_from_invalid,'區域群組未選擇',3);
				return;
			}

			if(
				this.state.fieldData['tw_city'] == undefined || this.state.fieldData['tw_city'] == '' ||
				this.state.fieldData['tw_country'] == undefined || this.state.fieldData['tw_country'] == ''
				){

				tosMessage(gb_title_from_invalid,'地址需填寫完整',3);
				return;
			}

		if(this.state.edit_type==1){

			jqPost(this.props.apiPathName,this.state.fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						alert('新增完成，可繼續輸入下一筆資料。'+data.message);
					}else{
						alert('新增完成，可繼續輸入下一筆資料。');
					}
					this.setState({
						fieldData:{
							area_id:'',
							tw_city:'',
							tw_country:''
						},
						show_insert_message:true});
				}else{
					alert(data.message);
					this.setState({error_data:data.error_data});
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
					if(data.message!=null){
						alert('修改完成'+data.message);
					}else{
						alert('修改完成');
					}
					$('a[href="#added"]').tab('show');//修改完後,顯示list頁面
				}else{
					alert(data.message);
					this.setState({error_data:data.error_data});
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		};


		return;
	},
	handleSubmit2: function(e) {

		e.preventDefault();

		if(this.state.edit_type==1){

			if(this.state.fieldData['customer_name'] == undefined){
				tosMessage(gb_title_from_invalid,'店名未填寫',3);
				return;
			}		

			if(this.state.fieldData['tel'] == undefined){
				tosMessage(gb_title_from_invalid,'電話未填寫',3);
				return;
			}		

			if(this.state.fieldData['area_id'] == undefined){
				tosMessage(gb_title_from_invalid,'區域群組未選擇',3);
				return;
			}

			if(
				this.state.fieldData['tw_city'] == undefined || this.state.fieldData['tw_city'] == '' ||
				this.state.fieldData['tw_country'] == undefined || this.state.fieldData['tw_country'] == '' ||
				this.state.fieldData['tw_address'] == undefined
				){

				tosMessage(gb_title_from_invalid,'地址需填寫完整',3);
				return;
			}

			this.state.fieldData['is_set_visit'] = true; //設定今日拜訪

			jqPost(this.props.apiPathName,this.state.fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					alert('新增完成並排入今日拜訪行程，可繼續輸入下一筆資料。');
					this.setState({
						fieldData:{
							area_id:'',
							tw_city:'',
							tw_country:''
						},
						show_insert_message:true});
				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}		
		else if(this.state.edit_type==2){
			
			this.state.fieldData['is_set_visit'] = true; //設定今日拜訪

			jqPut(this.props.apiPathName,this.state.fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					alert('修改完成');
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
	deleteSubmit:function(e){

		if(!confirm('確定是否刪除?')){
			return;
		}

		var ids = [];
		for(var i in this.state.gridData.rows){
			if(this.state.gridData.rows[i].check_del){
				ids.push('ids='+this.state.gridData.rows[i].customer_id);
			}
		}

		if(ids.length==0){
			tosMessage(null,'未選擇刪除項',2);
			return;
		}

		jqDelete(this.props.apiPathName + '?' + ids.join('&'),{})			
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				tosMessage(null,'刪除完成',1);
				this.queryGridData(0);
			}else{
				alert(data.message);
			}
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	handleSearch:function(e){
		e.preventDefault();
		this.queryGridData(0);
		return;
	},
	delCheck:function(i,chd){

		var newState = this.state;
		this.state.gridData.rows[i].check_del = !chd;
		this.setState(newState);
	},
	checkAll:function(){

		var newState = this.state;
		newState.checkAll = !newState.checkAll;
		for (var prop in this.state.gridData.rows) {
			this.state.gridData.rows[prop].check_del=newState.checkAll;
		}
		this.setState(newState);
	},
	gridData:function(page){

		var parms = {
			page:0
		};

		if(page==0){
			parms.page=this.state.gridData.page;
		}else{
			parms.page=page;
		}

		$.extend(parms, this.state.searchData);

		return jqGet(this.props.apiPathName,parms);
	},
	queryGridData:function(page){
		this.gridData(page)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	insertType:function(){
		this.setState({edit_type:1,fieldData:{},error_data:[]});
	},
	updateType:function(id){

		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {

			//data.data['birthday_1'] = moment(data.data['birthday_1'], "YYYY-MM-DD");
			//data.data['birthday_2'] = moment(data.data['birthday_2'], "YYYY-MM-DD");

			data.data['birthday_1'] = moment(data.data['birthday_1']).format('YYYY-MM-DD');
			data.data['birthday_2'] = moment(data.data['birthday_2']).format('YYYY-MM-DD');

			this.setState({edit_type:2,fieldData:data.data});
			$('#tabAddNew').tab('show');

			jqGet(gb_approot + 'api/GetAction/GetIsCustomerSetVisit',{customer_id:id})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({is_SetVisit:data,error_data:[]});
			}.bind(this));
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	noneType:function(){
		this.gridData(0)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_type:0,gridData:data,error_data:[]});
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
	queryTodayCustomer:function(){
		jqGet(gb_approot+'api/GetAction/GetTodayNewCustomerByUser',{})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({gridData:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	render: function() {
		var outHtml = null;
		var finish_insert_message = null;

		if(this.state.show_insert_message){
			finish_insert_message = (
			<div>
				<div className="alert alert-success">
					<strong><i className="glyphicon glyphicon-ok"></i> 新增完成，請繼續輸入下一筆資料</strong>
				</div>
			</div>
			);
		};

		var fieldData = this.state.fieldData;
		var tabVal=null;
		if(this.state.edit_type==1){
			tabVal=(
				<span>
					<i className="glyphicon glyphicon-plus"></i>
					新增客戶
				</span>
				);
		}else if(this.state.edit_type==2){
			tabVal=(
				<span>
					<i className="glyphicon glyphicon-pencil"></i>
					修改客戶資料
				</span>
				);
		}

		outHtml=(
			<div role="tabpanel">
			    <ul className="nav nav-tabs" role="tablist">
			        <li role="presentation" className="active">
			            <a href="#add" aria-controls="home" role="tab" data-toggle="tab" id="tabAddNew">
			            	{tabVal}
			            </a>
			        </li>
			        <li role="presentation">
			            <a href="#added" aria-controls="profile" role="tab" data-toggle="tab" id="tabAddView">
			                <i className="glyphicon glyphicon-user"></i> 本日已新增客戶
			            </a>
			        </li>
			    </ul>
			    <div className="tab-content">
			        <div role="tabpanel" className="tab-pane active" id="add">
			            <form className="form-horizontal" onSubmit={this.handleSubmit} name="frm">
			                <div className="col-md-12">
			                    <div className="form-group">
			                        <div className="col-md-4 col-md-offset-8 text-right">
			                            <button type="submit" className="btn btn-primary">
			                            	<i className="glyphicon glyphicon-ok"></i> 存檔
			                            </button>
			                            <button type="button" className="btn btn-success" onClick={this.handleSubmit2} disabled={this.state.is_SetVisit}>
			                            	<i className="glyphicon glyphicon-ok"></i> 存檔，排入今日行程
			                            </button>
			                        </div>
			                    </div>
			                </div>
			                <div className="col-md-6">
			                    <div className="form-group">
			                        <label for="" className="control-label col-xs-2">客戶編號</label>
			                        <div className="col-xs-4">
			                            <input type="text" className="form-control" maxLength="16"
			                                   value={fieldData.customer_sn}
												onChange={this.changeFDValue.bind(this,'customer_sn')} 
												placeholder="系統自動產生"
												disabled={true}
			                                   />
			                        </div>
			                        <label for="" className="control-label col-xs-2">統一編號</label>
			                        <div className="col-xs-4">
			                            <input type="text" className="form-control" maxLength="8"
			                                   value={fieldData.sno}
			                                   onChange={this.changeFDValue.bind(this,'sno')} />
			                        </div>
			                    </div>
			                    <div className="form-group">
			                        <label for="" className="control-label col-xs-2 text-danger">店名</label>
			                        <div className="col-xs-4">
			                            <input type="text" className="form-control"
			                                   value={fieldData.customer_name}
			                                   onChange={this.changeFDValue.bind(this,'customer_name')}
			                                   required />
			                        </div>
			                        <label for="" className="control-label col-xs-2">客戶全名</label>
			                        <div className="col-xs-4">
			                            <input type="text" className="form-control" />
			                        </div>
			                    </div>
			                    <TwAddress ver={2}
			                               label_name="地址"
			                               onChange={this.changeFDValue}
			                               setFDValue={this.setFDValue}
			                               zip_value={fieldData.tw_zip}
			                               city_value={fieldData.tw_city}
			                               country_value={fieldData.tw_country}
			                               address_value={fieldData.tw_address}
			                               zip_field="tw_zip"
			                               city_field="tw_city"
			                               country_field="tw_country"
			                               address_field="tw_address"
			                               required={true}
			                                />
			                                
			                    <div className="form-group">
			                        <label for="" className="control-label col-xs-2 text-danger">電話</label>
			                        <div className="col-xs-4">
			                            <input type="text" className="form-control"
			                                   value={fieldData.tel}
			                                   onChange={this.changeFDValue.bind(this,'tel')}
			                                   maxLength="16" 
			                                   
			                                   />
			                        </div>
			                        <label for="" className="control-label col-xs-2">傳真</label>
			                        <div className="col-xs-4">
			                            <input type="text" className="form-control"
			                                   value={fieldData.fax}
			                                   onChange={this.changeFDValue.bind(this,'fax')}
			                                   maxLength="16" />
			                        </div>
			                    </div>
			                    <div className="form-group">
			                    	<label className="control-label col-xs-2 text-danger">區域群組</label>
			                        <div className="col-xs-4">
			                            <select className="form-control"
			                                    value={fieldData.area_id}
			                                    onChange={this.changeFDValue.bind(this,'area_id')}
			                                    required={true}>
											<option value=""></option>
											{
												CommData.AreasData.map(function(itemData,i) {
													return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
												})
											}
			                            </select>
			                        </div>
			                        <label for="" className="control-label col-xs-2">行動電話</label>
			                        <div className="col-xs-4">
			                            <input type="text" className="form-control"
			                                   value={fieldData.mobile}
			                                   onChange={this.changeFDValue.bind(this,'mobile')}
			                                   maxLength="16" />
			                        </div>
			                    </div>
			                    <div className="form-group">
			                        <label for="" className="control-label col-xs-2">E-mail</label>
			                        <div className="col-xs-10">
			                            <input type="text" className="form-control"
			                                   value={fieldData.email}
			                                   onChange={this.changeFDValue.bind(this,'email')}
			                                   maxLength="128" />
			                        </div>
			                    </div>
			                </div>
			                <div className="col-md-6">
			                	<div className="form-group">
			                        
			                    </div>
			                    <div className="form-group">
			                        <label for="" className="control-label col-xs-2">客戶類別</label>
			                        <div className="col-xs-4">
			                            <select className="form-control"
			                                    value={fieldData.customer_type}
			                                    onChange={this.changeFDValue.bind(this,'customer_type')}>
			                                <option value="0"></option>
			                                <option value="1">店家</option>
			                                <option value="2">直客</option>
			                            </select>
			                        </div>
			                        <label for="" className="control-label col-xs-2">通路別</label>
			                        <div className="col-xs-4">
			                            <select className="form-control"
			                                    value={fieldData.channel_type}
			                                    onChange={this.changeFDValue.bind(this,'channel_type')}>
			                                <option value="0"></option>
			                                <option value="1">即飲</option>
			                                <option value="2">外帶</option>
			                            </select>
			                        </div>
			                    </div>
			                    <div className="form-group">
			                        <label for="" className="control-label col-xs-2">客戶型態</label>
			                        <div className="col-xs-4">
			                            <select className="form-control"
			                                    value={fieldData.store_type}
			                                    onChange={this.changeFDValue.bind(this,'store_type')}>
			                                <option value="0"></option>
			                                <option value="1">LS</option>
			                                <option value="2">Beer Store</option>
			                                <option value="3">Dancing</option>
			                                <option value="4">Bar</option>
			                                <option value="5">Cafe</option>
			                                <option value="6">Bistro</option>
			                                <option value="7">Restaurant</option>
			                            </select>
			                        </div>
			                        <label for="" className="control-label col-xs-2">型態等級</label>
			                        <div className="col-xs-4">
			                            <select className="form-control"
			                                    value={fieldData.store_level}
			                                    onChange={this.changeFDValue.bind(this,'store_level')}>
			                                <option value="0"></option>
			                                <option value="1">G</option>
			                                <option value="2">S</option>
			                                <option value="3">B</option>
			                            </select>
			                        </div>
			                    </div>
			                    <div className="form-group">
			                        <label for="" className="control-label col-xs-2">銷售等級</label>
			                        <div className="col-xs-4">
			                            <select className="form-control"
			                                    value={fieldData.evaluate}
			                                    onChange={this.changeFDValue.bind(this,'evaluate')}>
			                                <option value="0"></option>
			                                <option value="1">A</option>
			                                <option value="2">B</option>
			                                <option value="3">C</option>
			                            </select>
			                        </div>
			                        <label for="" className="control-label col-xs-2">客戶狀態</label>
			                        <div className="col-xs-4">
			                            <select className="form-control"
			                                    value={fieldData.state}
			                                    onChange={this.changeFDValue.bind(this,'state')}>
			                                <option value="0"></option>
			                                <option value="1">正常營業</option>
			                                <option value="2">歇業</option>
			                                <option value="3">未開店</option>
			                            </select>
			                        </div>
			                    </div>
			                    {/*<div className="form-group">
			                        <label for="" className="control-label col-xs-2">未訪原因</label>
			                        <div className="col-xs-10">
			                            <select name="" id="" className="form-control">
			                            	<option value=""></option>
			                                <option value="1">尚未營業</option>
			                                <option value="2">歇業</option>
			                            </select>
			                        </div>
			                    </div>*/}
			                    <div className="form-group">
			                        <label for="" className="control-label col-xs-2">營業起時</label>
			                        <div className="col-xs-4">
			                            <input type="time" className="form-control" />
			                        </div>
			                        <label for="" className="control-label col-xs-2">營業迄時</label>
			                        <div className="col-xs-4">
			                            <input type="time" className="form-control" />
			                        </div>
			                    </div>
			                    <div className="form-group">
			                        <label for="" className="control-label col-xs-2">聯絡人1</label>
			                        <div className="col-xs-4">
			                            <input type="text" className="form-control"
			                                   value={fieldData.contact_1}
			                                   onChange={this.changeFDValue.bind(this,'contact_1')}
			                                   maxLength="16" />
			                        </div>
			                        <label for="" className="control-label col-xs-2">生日</label>
			                        <div className="col-xs-4">
			                            <input type="date" className="form-control"
			                                   onChange={this.changeFDValue.bind(this,'birthday_1')}
			                                   value={fieldData.birthday_1} />
			                        </div>
			                    </div>
			                    <div className="form-group">
			                        <label for="" className="control-label col-xs-2">聯絡人2</label>
			                        <div className="col-xs-4">
			                            <input type="text" className="form-control"
			                                   value={fieldData.contact_2}
			                                   onChange={this.changeFDValue.bind(this,'contact_2')}
			                                   maxLength="16" />
			                        </div>
			                        <label for="" className="control-label col-xs-2">生日</label>
			                        <div className="col-xs-4">
			                            <input input type="date" className="form-control"
			                                   onChange={this.changeFDValue.bind(this,'birthday_2')}
			                                   value={fieldData.birthday_2} />
			                        </div>
			                    </div>
			                    <div className="form-group">
			                        <label for="" className="control-label col-xs-2">排序</label>
			                        <div className="col-xs-4">
			                            <input type="number" className="form-control"
			                                   value={fieldData.sort}
			                                   onChange={this.changeFDValue.bind(this,'sort')} />
			                        </div>
			                        <label for="" className="control-label col-xs-2">錯誤註記</label>
			                        <div className="col-xs-4">
			                            <select className="form-control"
										value={fieldData.mark_err}
										onChange={this.changeFDValue.bind(this,'mark_err')}
										>
											<option value="false">否</option>
											<option value="true">是</option>
										</select>
			                        </div>
			                    </div>
			                </div>
			                <div className="col-md-12">
			                    <div className="form-group">
			                        <label for="" className="control-label col-md-1 col-xs-2">主管備註</label>
			                        <div className="col-md-11 col-xs-10">
			                            <textarea cols="30" rows="2" className="form-control"
			                                      value={fieldData.memo}
			                                      onChange={this.changeFDValue.bind(this,'memo')}></textarea>
			                        </div>
			                    </div>
			                </div>
			                <div className="col-md-12">
				                <div className="form-group">
				                    <div className="alert alert-warning">
										<p>1.<strong className="text-danger">紅色標題</strong> 為必填欄位。</p>
										<p>2.地址格式請依照郵局格式填寫，地址<strong className="text-danger">段</strong>以前請勿填寫阿拉伯數字。</p>
										<p>3.客戶資料維護之<strong className="text-danger">店名、電話、地址</strong>只要其中一項有重複就無法儲存及修改。</p>
				                    </div>
			                    </div>
			                </div>
			                <div className="col-md-12">
				                <div className="form-group">
				                    <div className="alert alert-info">
										<p><strong className="text-info">如有重複下表將列出重複的客戶清單</strong></p>
										{
											this.state.error_data.map(function(itemData,i) {
												var error_html=
												<p key={i}>
													<strong className="text-danger">{itemData.error_name} : </strong> { }
													{
														itemData.r_customers.map(function(customer,i) {
															return <span>
															<span className="label label-primary">店名 - {customer.customer_name}</span> { }
															<span className="label label-primary">電話 - {customer.tel}</span> { }
															<span className="label label-primary">地址 - {customer.tw_city+customer.tw_country+customer.tw_address}</span>
															</span>;
														})
													}
												</p>;
												return error_html;
											})
										}
				                    </div>
			                    </div>
			                </div>			                
			            </form>
			        </div>
			        <div role="tabpanel" className="tab-pane" id="added">
			            <form action="" className="table-form form-inline">
			            </form>
			            <div className="table-responsive">
			                <table className="table table-bordered table-striped table-condensed">
			                	<tbody>
				                    <tr>
				                        <th className="text-center">修改</th>
				                        <th>店名</th>
				                        <th>縣市</th>
				                        <th>鄉鎮市</th>
				                        <th>地址</th>
				                        <th>店家/直客</th>
				                        <th>即飲/外帶</th>
				                        <th>客戶型態</th>
				                    </tr>
									{
										this.state.gridData.map(function(itemData,i) {
											var out_html =                     
												<tr key={itemData.customer_id}>
							                        <td className="text-center">
														<button className="btn btn-link" type="button" onClick={this.updateType.bind(this,itemData.customer_id)}>
															<i className="glyphicon glyphicon-pencil"></i>
														</button>
							                        </td>
							                        <td>{itemData.customer_name}</td>
							                        <td>{itemData.tw_city}</td>
							                        <td>{itemData.tw_country}</td>
							                        <td>{itemData.tw_address}</td>
							                        <td><IdForGrid id={itemData.customer_type} idData={CommData.CustomerType} /></td>
							                        <td><IdForGrid id={itemData.channel_type} idData={CommData.ChannelType} /></td>
							                        <td><IdForGrid id={itemData.store_type} idData={CommData.StoreType} /></td>
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