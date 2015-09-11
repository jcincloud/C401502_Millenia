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
					<td className="text-center"><GridCheckDel iKey={this.props.ikey} chd={this.props.itemData.check_del} delCheck={this.delCheck} /></td>
					<td className="text-center"><GridButtonModify modify={this.modify}/></td>
					<td>{this.props.itemData.y}</td>
					<td>{this.props.itemData.m}</td>
					<td>{this.props.itemData.agent_name}</td>					
				</tr>
			);
		}
});

var GirdForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:{rows:[],page:1},
			fieldData:{},
			searchData:{title:null},
			searchCustomer:{customers:[]},
			edit_type:0,
			checkAll:false,
			option_customer:[],
			option_product:[],
			option_agent:[],
			users_name:null,
			details:[
						//[{product_id:0,product_name:null},{product_id:0,product_name:null},{product_id:0,product_name:null}],
					],
			isShowProductSelect:false,
			isShowCustomerSelect:false,
			isShowQty:false,
			selectProduct:[],
			product_head:[],
			setQtyData:[],
			year_list:[],
			isSaveMasterData:true,
			country_list:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			gdCName:'searchCustomer',
			apiPathName:gb_approot+'api/Stock',
			apiDetailPathName:gb_approot+'api/StockDetail'

		};
	},
	componentDidMount:function(){
		this.queryGridData(1);
		this.setYearValue();
		this.queryAllAgnet();
		this.queryAllProduct();

		jqGet(gb_approot + 'api/GetAction/GetAllProduct',{})
		.done(function(data, textStatus, jqXHRdata) {
			//console.log('GirdForm componentDidMount',data);
			this.setState({productData:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
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
					this.setState({isSaveMasterData:true});
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
				ids.push('ids='+this.state.gridData.rows[i].stock_id);
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
	queryAllCustomer:function(){

			jqGet(gb_approot + 'api/GetAction/GetAllCustomer',this.state.searchCustomer)
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({option_customer:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});		
	},
	queryAllProduct:function(){

			jqGet(gb_approot + 'api/GetAction/GetAllProduct',{})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({option_product:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});		
	},
	queryAllAgnet:function(){

			jqGet(gb_approot + 'api/GetAction/GetAllAgent',{})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({option_agent:data});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});		
	},
	insertType:function(){

		var d = new Date();

		this.setState({
			edit_type:1,
			fieldData:{
				y:d.getFullYear(),
				//m:d.getMonth() + 1//改預設不要帶資料
			},
			users_name:gb_user_name,
			details:[]
		});
	},
	updateType:function(id){
		jqGet(this.props.apiPathName,{id:id})
		.done(function(data, textStatus, jqXHRdata) {

			jqGet(gb_approot + 'api/GetAction/GetStockDetail',{stock_id:id})
			.done(function(detail_data, textStatus, jqXHRdata) {
				this.setState({
					isShowProductSelect:false,
					details:detail_data.data,
					edit_type:2,
					fieldData:data.data,
					users_name:data.user_name
				});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});

		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});

/*
		jqGet(this.props.apiDetailPathName,{stock_id:id})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_type:2,details:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	*/	
	},
	noneType:function(){
		this.gridData(0)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({edit_type:0,gridData:data,isSaveMasterData:true});
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
	changeGDCValue:function(name,e){
		this.setSearchValue(this.props.gdCName,name,e);
	},
	changeDDValue:function(index,name,e){
		var get_details = this.state.details;
		var obj = get_details[index];

		if(e.target.value=='true'){
			obj[name] = true;
		}else if(e.target.value=='false'){
			obj[name] = false;
		}else{
			obj[name] = e.target.value;
		}

		if(obj.price!=undefined && obj.qty!=undefined){
			obj.sub_total = obj.price*obj.qty;
		}

		this.setState({details:get_details});
	},
	setFDValue:function(fieldName,value){
		//此function提供給次元件調用，所以要以屬性往下傳。
		var obj = this.state[this.props.fdName];
		obj[fieldName] = value;
		this.setState({fieldData:obj});
	},
	setSearchValue:function(collentName,name,e){
		if(name=='city'){
			this.listCountry(e.target.value);
		}
		var obj = this.state[collentName];
		if(e.target.value=='true'){
			obj[name] = true;
		}else if(e.target.value=='false'){
			obj[name] = false;
		}else{
			obj[name] = e.target.value;
		}
		this.setState({searchCustomer:obj});
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
	listCountry:function(value){
		for(var i in CommData.twDistrict){
			var item = CommData.twDistrict[i];
			if(item.city==value){
				this.setState({country_list:item.contain});
				break;
			}
		}
	},
	addDetail:function(){
		//設所有產品為未選
		var obj = this.state.option_product;
		for(var i in obj){
			var item = obj[i];
			item.is_take = false;
		}

		this.setState({isShowProductSelect:true,option_product:obj});
	},
	addCustomer:function(){
		this.setState({isShowCustomerSelect:true,option_customer:[]});
	},
	submitDetail:function(index,e){
		var obj = this.state.details;
		var item = obj[index];
		//console.log(item);
		if(item.customer_id==0){
			alert('未選擇客戶');
			return;
		}

		if(item.qty==0){
			alert('請填寫正確數量');
			return;
		}

		if(item.edit_type==1){
			jqPost(this.props.apiDetailPathName,item)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					alert('新增完成');
					item.edit_type = 0;
					item.customer_id = data.id;
					this.setState({details:obj});
				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}

		if(item.edit_type==2){
			jqPut(this.props.apiDetailPathName,item)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					alert('修改完成');
					item.edit_type = 0;
					this.setState({details:obj,isSaveMasterData:true});

				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}		
	},
	editDetail:function(index,e){
		var obj = this.state.details;
		var item = obj[index];
		this.state.keepDetail = clone(item);
		item.edit_type=2;
		this.setState({details:obj});
	},
	deleteDetail:function(index,e){
		var obj = this.state.details;
		var item = obj[index];

		if(item.edit_type==0 && confirm('確定是否刪除?')){
			jqDelete(this.props.apiDetailPathName,{id:item.stock_detail_id})
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					alert('刪除完成');
					obj.splice(index,1);
					this.setState({details:obj});
				}else{
					alert(data.message);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}

		if(item.edit_type==1){
			obj.splice(index,1);
			this.setState({details:obj});
		}
	},
	cancelDetail:function(index,e){
		var obj = this.state.details;
		var item = obj[index];

		item.edit_type=0;
		item.qty = this.state.keepDetail.qty;
		item.customer_id = this.state.keepDetail.customer_id;
		item.customer_name = this.state.keepDetail.customer_name;		
		this.setState({details:obj,keepDetail:null});
	},
	setMasterProduct:function(itemObj,index){
		var item = this.state.fieldData;

		item.product_id = itemObj.product_id;
		item.product_sn = itemObj.product_sn;
		item.product_name = itemObj.product_name;
		this.setState({fieldData:item});
	},
	setDetailCustomer:function(itemObj,index){
		var obj = this.state.details;
		var item = obj[index];
		item.customer_id = itemObj.customer_id;
		item.customer_name = itemObj.customer_name;
		this.setState({details:obj});
	},
	editQty:function(item_no){
		jqGet(gb_approot + 'api/GetAction/GetStockDetailQty',
			{stock_id:this.state.fieldData.stock_id,item_no:item_no})
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				this.setState({isShowQty:true,setQtyData:data.data,product_head:data.products});
			}
			else
			{
				alert(data.message);
			}
		}
		.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	deleteQty:function(item_no){
		if(!confirm('確定是否刪除?')){
			return;
		}
		jqGet(gb_approot + 'api/GetAction/DeleteStockDetailQty',
			{stock_id:this.state.fieldData.stock_id,item_no:item_no})
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				this.setState({details:data.data});
			}
			else
			{
				alert(data.message);
			}
		}
		.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	setOnBlurQty:function(index,offset,e){

		var obj = this.state.setQtyData;
		var row = obj[index];
		var cell = row.products[offset];

		var qty = e.target.value;

		jqPut(gb_approot + 'api/GetAction/PutStockQty',
			{stock_detail_qty_id:cell.stock_detail_qty_id,qty:qty})
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				cell.qty = qty;
				this.setState({setQtyData:obj});
			}
			else
			{
				alert(data.message);
			}
		}
		.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	setOnChangeQty:function(index,offset,e){

		var obj = this.state.setQtyData;
		var row = obj[index];
		var cell = row.products[offset];
		var qty = e.target.value;

		cell.qty = qty;
		this.setState({setQtyData:obj});
	},	
	closeProduct5Select:function(){
		//選完後不可更廠所選的產品，要更改要獎明細刪除。
		//此項功能只在新增明細會現。

		var collectProduct = [];

		for(var i in this.state.option_product){
			var item = this.state.option_product[i];
			if(item.is_take){
				collectProduct.push(item);
			}			
		}

		if(collectProduct.length==0){
			this.setState({isShowProductSelect:false});
			return;
		}

		jqPost(gb_approot + 'api/GetAction/PostSetStockSelectProduct',
			{stock_id:this.state.fieldData.stock_id,products:collectProduct})
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				this.setState({isShowProductSelect:false,details:data.data});
				this.editQty(data.item_no);
			}
			else
			{
				alert(data.message);
			}
		}
		.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	cancelProduct5Select:function(){
		for(var i in this.state.option_product){
			var item = this.state.option_product[i];
			if(item.is_take){
				this.state.option_product[i].is_take=false;
			}			
		}

		this.setState({isShowProductSelect:false});
		return;
	},
	closeCustomerSelect:function(){
		//新增前先抓好StockDetail的id
		//選完後更新編級畫面,並新增StockDetailQty
		var collectCustomer = [];

		for(var i in this.state.option_customer){
			var item = this.state.option_customer[i];
			if(item.is_take){
				collectCustomer.push(item);
			}			
		}

		if(collectCustomer.length==0){
			this.setState({isShowCustomerSelect:false});
			return;
		}
		//console.log(this.state.fieldData);
		jqPost(gb_approot + 'api/GetAction/PostSetStockSelectCustomer',
			{products:this.state.product_head,customers:collectCustomer,agent_id:this.state.fieldData.agent_id,stock_id:this.state.fieldData.stock_id,detail_id:this.state.product_head[0].stock_detail_id})
		.done(function(data, textStatus, jqXHRdata) {
			if(data.result){
				this.setState({isShowCustomerSelect:false,setQtyData:data.data});
			}
			else
			{
				alert(data.message);
			}
		}
		.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});
	},
	cancelCustomerSelect:function(){
		for(var i in this.state.option_customer){
			var item = this.state.option_customer[i];
			if(item.is_take){
				this.state.option_customer[i].is_take=false;
			}			
		}

		this.setState({isShowCustomerSelect:false});
		return;

	},
	closeSetQty:function(){
		this.setState({isShowQty:false});
	},
	setSelectProduct:function(index,e){
		var obj = this.state.option_product;
		//先修改
		var item = obj[index];
		item.is_take = !item.is_take;
		//在計算
		var n = 0;
		for(var i in obj){
			
			var product =  obj[i];
			if(product.is_take){
				n++;
			}
		}

		if(n>5){
			alert('產品最多只能選5樣');
			var item = obj[index];
			item.is_take = false;
		}

		this.setState({option_product:obj});
	},
	setSelectCustomer:function(index,e){
		var obj = this.state.option_customer;

		var item = obj[index];
		item.is_take = !item.is_take;

		this.setState({option_customer:obj});
	},
	handleSearchCustomer:function(){
		var searchCustomer=this.state.searchCustomer;
		//過濾已經有的客戶資料
		var ids = [];
        for (var key in this.state.setQtyData) {
            ids.push(this.state.setQtyData[key].customers.customer_id);
        }
        searchCustomer.customers=ids;
        this.state.searchCustomer.customers=ids;

  		this.setState({searchCustomer:searchCustomer});
  		this.queryAllCustomer();
	},
	setYearValue:function(){
		var start_year=2015;//設定起始年度
		var end_year = new Date().getFullYear();//取得目前年度
		for (; start_year <= end_year; start_year++) {
		    this.state.year_list.push(start_year);
		}
	},
	editMasterVal:function(){
		this.setState({isSaveMasterData:false});
	},
	render: function() {

 		var Button = ReactBootstrap.Button;

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
										{/*<label>編號</label> { }
										<input type="text" className="form-control" 
										value={searchData.title}
										onChange={this.changeGDValue.bind(this,'title')}
										placeholder="請輸入關鍵字..." />*/}

										<label>年度</label> { }
										<select className="form-control" 
											value={searchData.year}
											onChange={this.changeGDValue.bind(this,'year')}
										>
										<option value="">選擇年度</option>
										{
											this.state.year_list.map(function(itemData,i) {
												return <option key={itemData} value={itemData}>{itemData} 年</option>;
											})
										}
										</select> { }
										<label>月份</label> { }
										<select className="form-control" 
											value={searchData.month}
											onChange={this.changeGDValue.bind(this,'month')}
										>
										<option value="">選擇月份</option>
										{
											CommData.MonthsData.map(function(itemData,i) {
												return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
											})
										}
										</select> { }
										<button className="btn-primary" type="submit"><i className="fa-search"></i> 搜尋</button>
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
									<th className="col-xs-1">年</th>
									<th className="col-xs-1">月</th>
									<th className="col-xs-4">經銷商</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.stock_id} 
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

			var ModalProduct5 = ReactBootstrap.Modal;
			var MdoalSetQty = ReactBootstrap.Modal;
			var MdoalAddCustomer = ReactBootstrap.Modal;


			var fieldData = this.state.fieldData;
			var searchCustomer=this.state.searchCustomer;
			var outDetail = null;
			var product_out_html = null;
			var qty_modal_out_html = null;
			var customer_out_html = null;
			var detail_context = null;

			if(this.state.isShowProductSelect){
				product_out_html = 					
					<ModalProduct5 onRequestHide={this.closeProduct5Select}>
							<div className="modal-header light">
								<div className="pull-right">
									<button onClick={this.closeProduct5Select} className="btn-success"><i className="fa-check"></i> { } 確認送出</button> { }
									<button onClick={this.cancelProduct5Select}><i className="fa-times"></i> { } 取消</button>
								</div>
								<h4 className="modal-title">請選擇產品 { } (最多5樣)</h4>
							</div>
							<div className="modal-body">
								<table>
									<tbody>
										<tr>
											<th className="col-xs-1 text-center">選擇</th>
											<th className="col-xs-2">產品編號</th>
											<th className="col-xs-9">產品名稱</th>
										</tr>
										{
											this.state.option_product.map(function(itemData,i) {
												
												var product_out_html = 
													<tr key={itemData.product_id}>
														<td className="text-center"><input type="checkbox" checked={itemData.is_take} onChange={this.setSelectProduct.bind(this,i)} /></td>
														<td>{itemData.product_sn}</td>
														<td>{itemData.product_name}</td>
													</tr>;
												return product_out_html;
											}.bind(this))
										}
									</tbody>
								</table>
							</div>
							<div className="modal-footer">
								<button onClick={this.closeProduct5Select} className="btn-success"><i className="fa-check"></i> { } 確認送出</button> { }
								<button onClick={this.cancelProduct5Select}><i className="fa-times"></i> { } 取消</button>
							</div>
					</ModalProduct5>;
			}
			if(this.state.isShowCustomerSelect){
				customer_out_html = 					
					<MdoalAddCustomer onRequestHide={this.closeCustomerSelect}>
							<div className="modal-header light">
								<div className="pull-right">
									<button onClick={this.closeCustomerSelect} className="btn-success"><i className="fa-check"></i> { } 確認送出</button> { }
									<button onClick={this.cancelCustomerSelect}><i className="fa-times"></i> { } 取消</button>
								</div>
								<h4 className="modal-title">新增客戶對應</h4>
							</div>
							<div className='modal-body'>
							<div className="table-header">
								<div className="table-filter">
									<div className="form-inline">
				                        <div className="form-group">
				                            <input type="text" className="form-control input-sm" placeholder="店名/客編"
				                           	value={searchCustomer.word} 
	                						onChange={this.changeGDCValue.bind(this,'word')} /> { }
				                            <select name="" id="" className="form-control input-sm"
				                            onChange={this.changeGDCValue.bind(this,'area')}
											value={searchCustomer.area}> { }
				                                <option value="">區域群組</option>
											{
												CommData.AreasData.map(function(itemData,i) {
													return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
												})
											}
				                            </select> { }
				                            <select name="" id="" className="form-control input-sm"
				                       		onChange={this.changeGDCValue.bind(this,'city')}
											value={searchCustomer.city}>
				                                <option value="">縣市</option>
												{
													CommData.twDistrict.map(function(itemData,i) {
														return <option key={itemData.city} value={itemData.city}>{itemData.city}</option>;
													})
												}
				                            </select> { }
				                            <select className="form-control input-sm" 
													value={searchCustomer.country}
													onChange={this.changeGDCValue.bind(this,'country')}>
												<option value="">鄉鎮市區</option>
												{
													this.state.country_list.map(function(itemData,i) {
														return <option key={itemData.county} value={itemData.county}>{itemData.county}</option>;
													})
												}
											</select>
				                            <button onClick={this.handleSearchCustomer} className="btn-primary btn-sm"><i className="fa-search"></i> { } 搜尋</button>
					                    </div>
					                </div>
								</div>
							</div>
								<table className="table-condensed">
									<tbody>
										<tr>
											<th className="col-xs-1 text-center">選擇</th>
											<th className="col-xs-11">客戶名稱</th>
										</tr>
										{
											this.state.option_customer.map(function(itemData,i) {
												var customer_out_html =                     
													<tr key={itemData.customer_id}>
														<td className="text-center"><input type="checkbox" checked={itemData.is_take} onChange={this.setSelectCustomer.bind(this,i)} /></td>
														<td>{itemData.customer_name}</td>
													</tr>;
												return customer_out_html;
											}.bind(this))
										}
									</tbody>
		        				</table>
							</div>
							<div className='modal-footer'>
								<button onClick={this.closeCustomerSelect} className="btn-success"><i className="fa-check"></i> { } 確認送出</button> { }
								<button onClick={this.cancelCustomerSelect}><i className="fa-times"></i> { } 取消</button>
							</div>
					</MdoalAddCustomer>;
			}

			if(this.state.isShowQty){
				qty_modal_out_html = 
					<div>
					{customer_out_html}
					    <div className="table-header">
						    <div className="table-filter clearfix">
						        <div className="pull-right">
						        	<button onClick={this.addCustomer} className="btn-success"><i className="fa-plus"></i> { } 新增客戶對應</button> { }
						            <button className="btn-primary" onClick={this.closeSetQty}><i className="fa-check"></i> 儲存</button>
						        </div>
						        {/*<div className="form-inline">
						            <div className="form-group form-group-sm">
						                <label for="">縣市</label>
						                <select className="form-control" name="" id="">
						                    <option value="台北市">台北市</option>
						                </select>
						            </div>
						            <div className="form-group form-group-sm">
						                <label for="">鄉鎮</label>
						                <select className="form-control" name="" id="">
						                    <option value="大安區">大安區</option>
						                </select>
						            </div>
						            <div className="form-group">
						                <label for="">客編/店名</label>
						                <input className="form-control input-sm" type="text">
						            </div>
						            <button className="btn-primary btn-sm"><i className="fa-search"></i> 搜尋</button>
						        </div>*/}
						    </div>
					    </div>
						<table>
									<tbody>
										<tr>
											<th>客戶</th>
											{
												this.state.product_head.map(function(itemData,i) {
													var sub_out_html = <th key={itemData.product_id}> {itemData.product_name} </th>;
													return sub_out_html;
												}.bind(this))
											}
										</tr>
										
										{
											this.state.setQtyData.map(function(itemData,i) {

												var sub_out_html = 
												<tr key={itemData.customers.customer_id}>
													<td>{itemData.customers.customer_name}</td>
													{
														itemData.products.map(function(sub_itemData,j) {
															var sub_sub_out_html = 	
															<td key={sub_itemData.product_id}>
																	<input className="form-control text-right" type="number" value={sub_itemData.qty} onChange={this.setOnChangeQty.bind(this,i,j)} onBlur={this.setOnBlurQty.bind(this,i,j)} />
															</td>
															return sub_sub_out_html;
														}.bind(this))
													}
												</tr>;
												return sub_out_html;

											}.bind(this))
										}
										
									</tbody>
						</table>
						<div className="table-footer">
						    <div className="pull-right">
						    	<button onClick={this.addCustomer} className="btn-success"><i className="fa-plus"></i> { } 新增客戶對應</button> { }
						        <button className="btn-primary" onClick={this.closeSetQty}><i className="fa-check"></i> 儲存</button>
						    </div>
						</div>
					</div>;
			}

			if(qty_modal_out_html==null){
				detail_context = 
					<table>
						<tbody>
							<tr>
								<th className="col-xs-1 text-center">編輯</th>
								<th className="col-xs-2">產品一</th>
								<th className="col-xs-2">產品二</th>
								<th className="col-xs-2">產品三</th>
								<th className="col-xs-2">產品四</th>
								<th className="col-xs-2">產品五</th>
							</tr>
							{
								this.state.details.map(function(itemData,i) {
									var out_sub_html = 
										<tr key={i}>
											<td className="text-center">
												<button className="btn-link btn-lg" type="button" onClick={this.editQty.bind(this,itemData.item_no)} disabled={!this.state.isSaveMasterData}><i className="fa-pencil"></i></button>
												<button className="btn-link btn-lg text-danger" onClick={this.deleteQty.bind(this,itemData.item_no)} disabled={!this.state.isSaveMasterData}><i className="fa-trash-o"></i></button>
											</td>
											{
												itemData.products.map(function(sub_itemData,j) {
													return <td key={j}> {sub_itemData.product_name}</td>;
												}.bind(this))
											}
										</tr>;
									return out_sub_html;
								}.bind(this))
							}
						</tbody>
					</table>;
			}
			else
			{
				detail_context = qty_modal_out_html;
			}

			//edit_type=1 顯示
			var	save_master_button_html=(
				<div className="col-xs-3 text-right">
					<button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button> { }
					<button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
				</div>
			);
			//
			if(this.state.edit_type==2){
				var show_add_deatil_html=null;
				
				if(!this.state.isShowQty){
					show_add_deatil_html=(
							<button type="button" onClick={this.addDetail} className="btn-link text-success" disabled={!this.state.isSaveMasterData}><i className="fa-plus-circle"></i> 新增明細資料</button>
						);
					if(this.state.isSaveMasterData){
						save_master_button_html=(
							<div className="col-xs-3 text-right">
								<Button className="btn-success text-center" onClick={this.editMasterVal}><i className="fa-pencil"></i> 修改</Button> { }
								<button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
							</div>
						);
					}else{
						save_master_button_html=(
							<div className="col-xs-3 text-right">
								<button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button> { }
								<button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
							</div>
						);
					}

				}else{
					show_add_deatil_html=(
							<button onClick={this.closeSetQty} className="btn-link text-info"><i className="fa-reply"></i> 回上一頁</button>
						);
					save_master_button_html=null;//detail編輯畫面不顯示
				}
				outDetail = 
				<div>
					{product_out_html}
					<hr className="expanded" />
					<h4 className="title">
						客戶進貨資料明細檔 { }
						{show_add_deatil_html}
					</h4>
					{detail_context}
				</div>;	
			}

			outHtml=(
			<div>
				<ul className="breadcrumb">
					<li><i className="fa-list-alt"></i> {this.props.MenuName}</li>
				</ul>
				<h4 className="title">{this.props.Caption} 基本資料維護</h4>
				<form className="form-horizontal" onSubmit={this.handleSubmit}>
						<div className="form-group">
							<label className="col-xs-1 control-label">業務員</label>
							<div className="col-xs-1">
								<p className="form-control-static">{this.state.users_name}</p>
							</div>
							<label className="col-xs-1 control-label">進貨年</label>
							<div className="col-xs-1">
								<input type="number" 
								className="form-control"	
								value={fieldData.y}
								onChange={this.changeFDValue.bind(this,'y')}
								required
								disabled={this.state.isSaveMasterData && this.state.edit_type==2}
								 />

							</div>
							<label className="col-xs-1 control-label">進貨月</label>
							<div className="col-xs-1">
								<input type="number" 
								className="form-control"	
								value={fieldData.m}
								onChange={this.changeFDValue.bind(this,'m')}
								required
								disabled={this.state.isSaveMasterData && this.state.edit_type==2}
								 />

							</div>
							<label className="col-xs-1 control-label">經銷商</label>
							<div className="col-xs-2">
								<select className="form-control" 
										onChange={this.changeFDValue.bind(this,'agent_id')}
										value={fieldData.agent_id}
										required
										disabled={this.state.isSaveMasterData && this.state.edit_type==2}>
									<option value=""></option>
									{
										this.state.option_agent.map(function(itemData,i) {
											var out_sub_html =                     
													<option value={itemData.agent_id} key={itemData.agent_id}>{itemData.agent_name}</option>;
											return out_sub_html;
										}.bind(this))
									}
								</select>
							</div>

							{save_master_button_html}

						</div>
				</form>
				{outDetail}
			</div>
			);
		}
		return outHtml;
	}
});