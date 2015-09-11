var GridRow = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return { 
		};  
	},
	delCheck:function(i,chd){
		this.props.delCheck(i,chd);
	},
	modify:function(){
		this.props.updateType(this.props.primKey);
	},
	areaFilter:function(area_id){
		var areaLabel="";
		CommData.AreasData.forEach(function(object, i){
        	if(area_id==object.id){
  				areaLabel=object.label;
        	}
    	})
		return areaLabel;
	},
	render:function(){
		return (

				<tr>
					<td className="text-center"><GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
					<td className="text-center"><GridButtonModify modify={this.modify}/></td>
					<td>{this.props.itemData.customer_name}</td>
					<td>{this.props.itemData.tel}</td>
					<td>{this.areaFilter(this.props.itemData.area_id)}</td>
					<td>{this.props.itemData.tw_city}</td>
					<td>{this.props.itemData.tw_country}</td>
					<td>{this.props.itemData.tw_address}</td>
				</tr>
			);
		}
});

//主表單
var GirdForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:{rows:[],page:1},
			fieldData:{},
			searchData:{title:null},
			edit_type:0,
			checkAll:false,
			country_list:[],
			next_id:null
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
		this.queryGridData(1);
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
	},
	handleSubmit: function(e) {

		e.preventDefault();
		   var $btn = $(document.activeElement);
		   var btn_name=$btn.context.name;
		   if(this.state.fieldData['tel']!=undefined && this.state.fieldData['tel']!=''){
		   		if(this.state.fieldData['tel'].indexOf('-')!=-1 || this.state.fieldData['tel'].indexOf(' ')!=-1 ||
		   			this.state.fieldData['tel'].indexOf('　')!=-1){
		   			tosMessage(gb_title_from_invalid,'電話請勿輸入「空白」或「-」！！',3);
		   			return;
		   		}
		   		if(this.state.fieldData['tel'].charAt(0)!=0){
		   			tosMessage(gb_title_from_invalid,'電話前面請輸入區域號碼！！',3);
		   			return;
		   		}

		   }


		if(this.state.edit_type==1){
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

			jqPost(this.props.apiPathName,this.state.fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					if(data.message!=null){
						tosMessage(null,'新增完成'+data.message,1);
					}else{
						tosMessage(null,'新增完成',1);
					}
					this.updateType(data.id);
				}else{
					tosMessage(null,data.message,3);
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
						tosMessage(null,'修改完成'+data.message,1);
					}else{
						tosMessage(null,'修改完成',1);
					}
					//判斷是否顯示下一筆
					if(btn_name=="btn-2"){
						this.getNextCustomerId(data.id)
						.done(function(Nextdata, textStatus, jqXHRdata) {
							if(Nextdata.result){
								console.log('now_id',data.id,'next_id',Nextdata.data);
								this.updateType(Nextdata.data);
							}
						}.bind(this))
						.fail(function(jqXHR, textStatus, errorThrown) {
							showAjaxError(errorThrown);
						});
						
					}
				}else{
					tosMessage(null,data.message,3);
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
				tosMessage(null,data.message,3);
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
	onAreaChange:function(e){
		var obj = this.state.searchData;
		obj['area'] = e.target.value;
		this.setState({searchData:obj});
	},
	getNextCustomerId:function(now_id){
		var parms = {
			now_id:now_id
		};
		$.extend(parms, this.state.searchData);

		return jqGet(gb_approot + 'api/GetAction/GetCustomerNextId',parms);
	},
	render: function() {
		var outHtml = null;

		if(this.state.edit_type==0)
		{
			var searchData = this.state.searchData;

			outHtml =
			(
			<div>
				<ul className="breadcrumb">
					<li><i className="fa-list-alt"></i> {this.props.MenuName}</li>
				</ul>
				<h3 className="title">
					{this.props.Caption}
				</h3>
				<form onSubmit={this.handleSearch}>
					<div className="table-responsive">
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline">
									<div className="form-group">

										<label className="sr-only">客戶名稱</label> { }
										<input type="text" className="form-control" 
										value={searchData.customer_name}
										onChange={this.changeGDValue.bind(this,'customer_name')}
										placeholder="客戶名稱..." /> { }

										<label className="sr-only">tel</label> { }
										<input type="text" className="form-control" 
										value={searchData.tel}
										onChange={this.changeGDValue.bind(this,'tel')}
										placeholder="電話..." /> { }

										<label className="sr-only">區域群組</label> { }
										<select className="form-control" 
												value={searchData.area}
												onChange={this.onAreaChange}>
											<option value="">選擇區域</option>
										{
											CommData.AreasData.map(function(itemData,i) {
												return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
										</select> { }

										<label className="sr-only">縣市</label> { }
										<select className="form-control" 
											value={searchData.city}
											onChange={this.onCityChange}
										>
										<option value="">選擇縣市</option>
										{
											CommData.twDistrict.map(function(itemData,i) {
												return <option key={itemData.city} value={itemData.city}>{itemData.city}</option>;
											})
										}
										</select> { }

										<label className="sr-only">鄉鎮市區</label> { }
										<select className="form-control" 
												value={searchData.country}
												onChange={this.onCountryChange}>
											<option value="">選擇鄉鎮市區</option>
											{
												this.state.country_list.map(function(itemData,i) {
													return <option key={itemData.county} value={itemData.county}>{itemData.county}</option>;
												})
											}
										</select>

										<label className="sr-only">地址</label> { }
										<input type="text" className="form-control" 
										value={searchData.address}
										onChange={this.changeGDValue.bind(this,'address')}
										placeholder="地址..." /> { }

										<label className="sr-only">錯誤註記</label> { }
										<select className="form-control"
										value={searchData.mark_err}
										onChange={this.changeGDValue.bind(this,'mark_err')}
										>
											<option value="">錯誤註記</option>
											<option value="false">否</option>
											<option value="true">是</option>
										</select> { }
										<button className="btn-primary" type="submit"><i className="fa-search"></i>{ }搜尋</button>
									</div>
								</div>
							</div>
						</div>
						<table>
							<thead>
								<tr>
									<th className="col-xs-1 text-center">
										<label className="cbox">
											<input type="checkbox" checked={this.state.checkAll} onChange={this.checkAll} />
											<i className="fa-check"></i>
										</label>
									</th>
									<th className="col-xs-1 text-center">修改</th>
									<th className="col-xs-2">名稱</th>
									<th className="col-xs-1">電話</th>
									<th className="col-xs-1">區域群組</th>
									<th className="col-xs-1">縣市</th>
									<th className="col-xs-1">鄉鎮</th>
									<th className="col-xs-4">地址</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.customer_id} 
								itemData={itemData} 
								delCheck={this.delCheck}
								updateType={this.updateType}								
								/>;
								}.bind(this))
								}
							</tbody>
						</table>
					</div>
					<GridNavPage 
					StartCount={this.state.gridData.startcount}
					EndCount={this.state.gridData.endcount}
					RecordCount={this.state.gridData.records}
					TotalPage={this.state.gridData.total}
					NowPage={this.state.gridData.page}
					onQueryGridData={this.queryGridData}
					InsertType={this.insertType}
					deleteSubmit={this.deleteSubmit}
					/>
				</form>
			</div>
			);
		}
		else if(this.state.edit_type==1 || this.state.edit_type==2)
		{
			var fieldData = this.state.fieldData;
			var NextButton_Html=null;
			if(this.state.edit_type==2){
				NextButton_Html=(
					<button type="submit" className="btn-primary" name="btn-2"><i className="fa-check"></i> 儲存,下一筆</button>
					);
			}

			outHtml=(
			<div>
				<ul className="breadcrumb">
					<li><i className="fa-list-alt"></i> {this.props.MenuName}</li>
				</ul>
				<h4 className="title">{this.props.Caption}</h4>
				<form className="form-horizontal" onSubmit={this.handleSubmit}>
				<div className="col-xs-6">
					<div className="form-group">
						<label className="col-xs-2 control-label">客戶編號</label>
						<div className="col-xs-4">
							<input type="text" 
							className="form-control"	
							value={fieldData.customer_sn}
							onChange={this.changeFDValue.bind(this,'customer_sn')}
							placeholder="系統自動產生"
							disabled={true}
							 />
						</div>
						<label className="col-xs-2 control-label">統一編號</label>
						<div className="col-xs-4">
							<input type="text" 
							className="form-control"	
							value={fieldData.sno}
							onChange={this.changeFDValue.bind(this,'sno')}
							maxLength="8"
							 />
						</div>
					</div>
					<div className="form-group">
						<label className="col-xs-2 control-label text-danger">店名</label>
						<div className="col-xs-4">
							<input type="text" 							
							className="form-control"	
							value={fieldData.customer_name}
							onChange={this.changeFDValue.bind(this,'customer_name')}
							maxLength="64"
							required />
						</div>

						<label className="col-xs-2 control-label">客戶全名</label>
						<div className="col-xs-4">
							<input type="text" 
							className="form-control"	
							value={fieldData.customer_all_name}
							onChange={this.changeFDValue.bind(this,'customer_all_name')}
							maxLength="128"
							 />
						</div>
					</div>
						<TwAddress ver={2}
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
						/>

					<div className="form-group">
						<label className="col-xs-2 control-label text-danger">電話</label>
						<div className="col-xs-4">
							<input type="tel" 
							className="form-control"	
							value={fieldData.tel}
							onChange={this.changeFDValue.bind(this,'tel')}
							 />
						</div>
						<label className="col-xs-2 control-label">傳真</label>
						<div className="col-xs-4">
							<input type="tel" 
							className="form-control"	
							value={fieldData.fax}
							onChange={this.changeFDValue.bind(this,'fax')}
							 />
						</div>
					</div>
					<div className="form-group">
						<label className="col-xs-2 control-label text-danger">區域群組</label>
						<div className="col-xs-4">
							<select className="form-control" 
							value={fieldData.area_id}
							onChange={this.changeFDValue.bind(this,'area_id')}
							required>
								<option value="0"></option>
								{
									CommData.AreasData.map(function(itemData,i) {
										return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
									})
								}
							</select>
						</div>
						<label className="col-xs-2 control-label">行動電話</label>
						<div className="col-xs-4">
							<input type="tel" 
							className="form-control"	
							value={fieldData.mobile}
							onChange={this.changeFDValue.bind(this,'mobile')}
							 />
						</div>
					</div>
					<div className="form-group">
						<label className="col-xs-2 control-label">Email</label>
						<div className="col-xs-10">
							<input type="email" 
							className="form-control"	
							value={fieldData.email}
							onChange={this.changeFDValue.bind(this,'email')}
							maxLength="128"
							 />
						</div>
					</div>
				</div>
				<div className="col-xs-6">
					<div className="form-group">
						<label className="col-xs-2 control-label">客戶類別</label>
						<div className="col-xs-4">
							<select className="form-control" 
							value={fieldData.customer_type}
							onChange={this.changeFDValue.bind(this,'customer_type')}>
								<option value="0"></option>
								<option value="1">店家</option>
								<option value="2">直客</option>
							</select>
						</div>
						<label className="col-xs-2 control-label">通路別</label>
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
						<label className="col-xs-2 control-label">客戶型態</label>
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
						<label className="col-xs-2 control-label">型態等級</label>
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
						<label className="col-xs-2 control-label">銷售等級</label>
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
						<label className="col-xs-2 control-label">客戶狀態</label>
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
					<div className="form-group">
						<label className="col-xs-2 control-label">營業起時</label>
						<div className="col-xs-4">
							<input type="time" 
							className="form-control"	
							value={fieldData.opening_time_1}
							onChange={this.changeFDValue.bind(this,'opening_time_1')}
							maxLength="16"
							 />
						</div>

						<label className="col-xs-2 control-label">營業迄時</label>
						<div className="col-xs-4">
							<input type="time" 
							className="form-control"	
							value={fieldData.opening_time_2}
							onChange={this.changeFDValue.bind(this,'opening_time_2')}
							maxLength="16"
							 />
						</div>
					</div>
					<div className="form-group">
						<label className="col-xs-2 control-label">聯絡人1</label>
						<div className="col-xs-4">
							<input type="text" 
							className="form-control"	
							value={fieldData.contact_1}
							onChange={this.changeFDValue.bind(this,'contact_1')}
							maxLength="16"
							 />
						</div>
						<label className="col-xs-2 control-label">生日</label>
						<div className="col-xs-4">
							<span className="has-feedback">
								<InputDate id="birthday_1" 
								onChange={this.changeFDValue} 
								field_name="birthday_1" 
								value={fieldData.birthday_1} />
							</span>
						</div>
					</div>
					<div className="form-group">
						<label className="col-xs-2 control-label">聯絡人2</label>
						<div className="col-xs-4">
							<input type="text" 
							className="form-control"	
							value={fieldData.contact_2}
							onChange={this.changeFDValue.bind(this,'contact_2')}
							maxLength="16"
							 />
						</div>
						<label className="col-xs-2 control-label">生日</label>
						<div className="col-xs-4">
							<span className="has-feedback">
								<InputDate id="birthday_2" 
								onChange={this.changeFDValue} 
								field_name="birthday_2" 
								value={fieldData.birthday_2} />
							</span>
						</div>
					</div>
					<div className="form-group">
						<label className="col-xs-2 control-label">排序</label>
						<div className="col-xs-4">
							<input type="number" 
							className="form-control"
							value={fieldData.sort}
							onChange={this.changeFDValue.bind(this,'sort')} />
						</div>
						<label className="col-xs-2 control-label">錯誤註記</label>
						<div className="col-xs-4">
							<select className="form-control"
							value={fieldData.mark_err}
							onChange={this.changeFDValue.bind(this,'mark_err')}
							>
								<option value={false}>否</option>
								<option value={true}>是</option>
							</select>
						</div>
					</div>
				</div>
				<div className="col-xs-12">
					<div className="form-group">
						<label className="col-xs-1 control-label">主管備註</label>
						<div className="col-xs-11">
							<textarea col="30" row="2" className="form-control"
							value={fieldData.memo}
							onChange={this.changeFDValue.bind(this,'memo')}></textarea>
						</div>
					</div>
					<div className="form-action text-center">
						<button type="submit" className="btn-primary" name="btn-1"><i className="fa-check"></i> 儲存</button> { }
						{NextButton_Html}
						<button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
					</div>
					<div className="alert alert-warning">
						<p><strong className="text-danger">紅色標題</strong> 為必填欄位。</p>
						<p>地址格式請依照郵局格式填寫，地址<strong className="text-danger">段</strong>以前請勿填寫阿拉伯數字。</p>
					</div>
				</div>
				</form>
			</div>
			);
		}else{
			outHtml=(<span>No Page</span>);
		}

		return outHtml;
	}
});