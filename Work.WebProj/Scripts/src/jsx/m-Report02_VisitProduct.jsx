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
	render:function(){
		return (

				<tr>
					<td>{this.props.itemData.user_name}</td>
					<td>{this.props.itemData.customer_name}</td>
					<td>{this.props.itemData.product_name}</td>
					<td className="text-center">{this.props.itemData.price>0?<span className="label label-success">yes</span>:<span className="label label-default">no</span>}</td>
					<td className="text-right">{this.props.itemData.price}</td>
					<td>{moment(this.props.itemData.visit_date).format('YYYY-MM-DD')}</td>
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
			searchData:{title:null,start_date:new Date().getFullYear()+'/1/1',end_date:moment(Date()).format('YYYY/MM/DD')},
			edit_type:0,
			checkAll:false,
			option_users:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/GetAction/GetVisitProducts'
		};
	},	
	componentDidMount:function(){
		this.queryGridData(1);
		this.querySales();
	},
	shouldComponentUpdate:function(nextProps,nextState){
		return true;
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
	querySales:function(){

			jqGet(gb_approot + 'api/GetAction/GetUsers',{})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({option_users:data});
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
	excelPrint:function(e){
		e.preventDefault();

		var parms = {tid:uniqid()};
		$.extend(parms, this.state.searchData);

		var url_parms = $.param(parms);
		var print_url = gb_approot + 'Base/ExcelReport/downloadExcel_VisitProduct?' + url_parms;

		this.setState({download_src:print_url});
		return;
	},
	onUsersChange:function(e){
		var obj = this.state.searchData;
		obj['users_id'] = e.target.value;
		this.setState({searchData:obj});
	},
	render: function() {
		var outHtml = null;
		var managerHtml=null;

			var searchData = this.state.searchData;

			if(!is_sales){
				managerHtml=(
					<span>
						<label className="sr-only">選擇業務</label>
						<select className="form-control"
										id="Users"
										onChange={this.onUsersChange}
										value={searchData.users_id}>
							<option value="">選擇業務</option>
							{
								this.state.option_users.map(function(itemData,i) {
									var out_sub_html =                     
										<option value={itemData.Id} key={itemData.Id}>{itemData.UserName}</option>;
									return out_sub_html;
								}.bind(this))
							}
						</select> { }
					</span>);
			}

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
					
						<div className="table-header">
							<div className="table-filter">
								<div className="form-inline">
									<div className="form-group">
										<label>日期區間</label> { }								
											<span className="has-feedback">
												<InputDate id="start_date" 
												onChange={this.changeGDValue} 
												field_name="start_date" 
												value={searchData.start_date} />
											</span> { }
										<label>~</label> { }	
											<span className="has-feedback">
												<InputDate id="end_date" 
												onChange={this.changeGDValue} 
												field_name="end_date" 
												value={searchData.end_date} />
											</span> { }
									</div>
									<div className="form-group">
										{managerHtml}

										<label className="sr-only">選擇區域</label>
										<select className="form-control"
														id="Users"
														onChange={this.changeGDValue.bind(this,'area')}
														value={searchData.area}>
											<option value="">選擇區域</option>
										{
											CommData.AreasData.map(function(itemData,i) {
												return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
										</select>
										
										<label className="sr-only">客戶名稱</label> { }
										<input type="text" className="form-control" 
										value={searchData.customer_name}
										onChange={this.changeGDValue.bind(this,'customer_name')}
										placeholder="客戶名稱..." />

										<label className="sr-only">產品名稱</label> { }
										<input type="text" className="form-control" 
										value={searchData.product_name}
										onChange={this.changeGDValue.bind(this,'product_name')}
										placeholder="產品名稱..." /> { }
										<button className="btn-primary" type="submit"><i className="fa-search"></i>{ }搜尋</button> { }
										<button className="btn-success" type="button" onClick={this.excelPrint}><i className="fa-print"></i> 列印</button>
									</div>
								</div>
							</div>
						</div>
						<table>
							<thead>
								<tr>
									<th className="col-xs-2">業務名稱</th>
									<th className="col-xs-2">客戶名稱</th>
									<th className="col-xs-4">產品名稱</th>
									<th className="col-xs-1">是否分布</th>
									<th className="col-xs-1">售價</th>
									<th className="col-xs-2">拜訪日期</th>
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
					<GridNavPage 
					StartCount={this.state.gridData.startcount}
					EndCount={this.state.gridData.endcount}
					RecordCount={this.state.gridData.records}
					TotalPage={this.state.gridData.total}
					NowPage={this.state.gridData.page}
					onQueryGridData={this.queryGridData}
					InsertType={this.insertType}
					deleteSubmit={this.deleteSubmit}
					showAdd={false}
					showDelete={false}
					/>
					<iframe src={this.state.download_src} style={ {visibility:'hidden',display:'none'} } />
				</form>
			</div>
			);
		return outHtml;
	}
});