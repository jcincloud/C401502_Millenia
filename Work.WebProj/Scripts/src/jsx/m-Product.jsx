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
					<td>{this.props.itemData.product_sn}</td>
					<td>{this.props.itemData.product_name}</td>
					<td>{this.props.itemData.product_name_c}</td>
					<td>{this.props.itemData.product_category_name}</td>
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
			option_product_category:[],
			option_product_brand:[]
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
		this.queryGridData(1);
		this.queryProductCategory();
		this.queryProductBrand();
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
	deleteSubmit:function(e){

		if(!confirm('確定是否刪除?')){
			return;
		}

		var ids = [];
		for(var i in this.state.gridData.rows){
			if(this.state.gridData.rows[i].check_del){
				ids.push('ids='+this.state.gridData.rows[i].product_id);
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
	queryProductCategory:function(){
		jqGet(gb_approot + 'api/GetAction/GetProductCategory',{})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({option_product_category:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	queryProductBrand:function(){
		jqGet(gb_approot + 'api/GetAction/GetProductBrand',{})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({option_product_brand:data});
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
										<label className="sr-only">產品名稱</label> { } 
										<input type="text" className="form-control" 
										value={searchData.product_name}
										onChange={this.changeGDValue.bind(this,'product_name')}
										placeholder="產品名稱..." />
										{ } <label className="sr-only">產品分類</label> { } 
										<select className="form-control" 
										value={searchData.product_category_id}
										onChange={this.changeGDValue.bind(this,'product_category_id')}>
										<option value="">產品分類</option>
											{
												this.state.option_product_category.map(function(itemData,i) {
													var sub_out_option = <option value={itemData.product_category_id}>{itemData.product_category_name}</option>;
													return sub_out_option;
												}.bind(this))
											}
										</select>
										{ } <button className="btn-primary" type="submit"><i className="fa-search"></i> 搜尋</button>
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
									<th className="col-xs-2">產品編號</th>
									<th className="col-xs-3">產品名稱</th>
									<th className="col-xs-3">中文名稱</th>
									<th className="col-xs-2">分類</th>
								</tr>
							</thead>
							<tbody>
								{
								this.state.gridData.rows.map(function(itemData,i) {
								return <GridRow 
								key={i}
								ikey={i}
								primKey={itemData.product_id} 
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

			outHtml=(
			<div>
				<ul className="breadcrumb">
					<li><i className="fa-list-alt"></i> {this.props.MenuName}</li>
				</ul>
				<h4 className="title">{this.props.Caption} 基本資料維護</h4>
				<form className="form-horizontal" onSubmit={this.handleSubmit}>
					<div className="col-xs-6">
						<div className="alert alert-warning">
							<p><strong className="text-danger">紅色標題</strong> 為必填欄位。</p>
						</div>
						<div className="form-group">
							<label className="col-xs-2 control-label text-danger">產品編號</label>
							<div className="col-xs-10">
								<input type="text" 
								className="form-control"	
								value={fieldData.product_sn}
								onChange={this.changeFDValue.bind(this,'product_sn')}
								maxLength="16"
								required />
							</div>
						</div>
						<div className="form-group">
							<label className="col-xs-2 control-label">產品類別</label>
							<div className="col-xs-10">
								<select className="form-control" 
								value={fieldData.product_category_id}
								onChange={this.changeFDValue.bind(this,'product_category_id')}>
									{
										this.state.option_product_category.map(function(itemData,i) {
											var sub_out_option = <option value={itemData.product_category_id}>{itemData.product_category_name}</option>;
											return sub_out_option;
										}.bind(this))
									}
								</select>
							</div>
						</div>
						<div className="form-group">
							<label className="col-xs-2 control-label">品牌</label>
							<div className="col-xs-10">
								<select className="form-control" 
								value={fieldData.product_brand_id}
								onChange={this.changeFDValue.bind(this,'product_brand_id')}>
									{
										this.state.option_product_brand.map(function(itemData,i) {
											var sub_out_option = <option value={itemData.product_brand_id}>{itemData.product_brand_name}</option>;
											return sub_out_option;
										}.bind(this))
									}
								</select>
							</div>
						</div>
						<div className="form-group">
							<label className="col-xs-2 control-label text-danger">品名</label>
							<div className="col-xs-6">
								<input type="text" 							
								className="form-control"	
								value={fieldData.product_name}
								onChange={this.changeFDValue.bind(this,'product_name')}
								maxLength="6"
								required />					
							</div>
							<small className="col-xs-4 help-inline">最多6個字</small>
						</div>
						<div className="form-group">
							<label className="col-xs-2 control-label">中文名稱</label>
							<div className="col-xs-10">
								<input type="text" 
								className="form-control"	
								value={fieldData.product_name_c}
								onChange={this.changeFDValue.bind(this,'product_name_c')}
								maxLength="128"
								 />
							</div>
							{/* 舊的品牌資料為字串,新的改用分類選單
							<label className="col-xs-2 control-label">品牌</label>
							<div className="col-xs-4">
								<input type="text" 							
								className="form-control"	
								value={fieldData.brand}
								onChange={this.changeFDValue.bind(this,'brand')}
								maxLength="32"
								 />
							</div>*/}
						</div>

						<div className="form-group">
							<label className="col-xs-2 control-label">規格</label>
							<div className="col-xs-10">
								<input type="text" 							
								className="form-control"	
								value={fieldData.standard}
								onChange={this.changeFDValue.bind(this,'standard')}
								maxLength="32"
								 />
							</div>

						</div>

						<div className="form-action">
							<div className="col-xs-10 col-xs-offset-2">
								<button type="submit" className="btn-primary"><i className="fa-check"></i> 儲存</button> { }
								<button type="button" onClick={this.noneType}><i className="fa-times"></i> 回前頁</button>
							</div>
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