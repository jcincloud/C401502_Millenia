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
	filter:function(value,LName){
		var Label="無";
		CommData[LName].forEach(function(object, i){
        	if(value==object.id){
  				Label=object.label;
        	}
    	})
		return Label;
	},
	render:function(){
		return (

				<tr>
					<td>{this.props.itemData.product_name}</td>
					<td>{this.props.itemData.customer_name}</td>
					<td>{this.props.itemData.qty}</td>
					<td>{this.filter(this.props.itemData.customer_type,'CustomerType')}</td>
					<td>{this.filter(this.props.itemData.channel_type,'ChannelType')}</td>
					<td>{this.filter(this.props.itemData.evaluate,'Evaluate')}</td>
					<td>{this.filter(this.props.itemData.store_type,'StoreType')}</td>
					<td>{this.filter(this.props.itemData.store_level,'StoreLevel')}</td>
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
			searchData:{products:[],start_date:new Date().getFullYear()+'/1/1',end_date:moment(Date()).format('YYYY/MM/DD')},
			edit_type:0,
			checkAll:false,
			isShowProductSelect:false,
			option_product:[],
			show_product:'',
			print_excel:true
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/GetAction/PostCustomerProduct'
		};
	},	
	componentDidMount:function(){
		this.queryGridData(1);
		this.queryAllProduct();
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

		return jqPost(this.props.apiPathName,parms);
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
	queryAllProduct:function(){
			jqGet(gb_approot + 'api/GetAction/GetAllProduct',{})
			.done(function(data, textStatus, jqXHRdata) {
				this.setState({option_product:data});
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
		var ids = [];var names=[];
        for (var key in this.state.searchData.products) {
            ids.push('ids=' + this.state.searchData.products[key].product_id);
            names.push('names=' + this.state.searchData.products[key].product_name);
        }
        var url_parms=url_parms+'&'+ids.join('&')+'&'+names.join('&');

		var print_url = gb_approot + 'Base/ExcelReport/downloadExcel_CustomerProduct?' + url_parms;

		this.setState({download_src:print_url});
		return;
	},
	showProduct5Select:function(){
		this.setState({isShowProductSelect:true});
	},
	closeProduct5Select:function(){
		var searchData = this.state.searchData;
		var showName="";
		var temp=[];

		for(var i in this.state.option_product){
			var item = this.state.option_product[i];
			if(item.is_take){
				temp.push(item);
				showName+=item.product_name+"、";
			}			
		}
		searchData.products=temp;

		if(temp.length==0){
			this.setState({isShowProductSelect:false,show_product:showName,searchData:searchData,print_excel:true});
			return;
		}else{
			this.setState({isShowProductSelect:false,show_product:showName,searchData:searchData,print_excel:false});
			return;
		}
	},
	cancelProduct5Select:function(){
		var searchData = this.state.searchData;
		var temp=[];
		var obj=this.state.option_product;

		for(var i in obj){
			var item = obj[i];
			if(item.is_take){
				obj[i].is_take=false;
			}			
		}
		searchData.products=temp;

		this.setState({option_product:obj,isShowProductSelect:false,show_product:"",searchData:searchData,print_excel:true});
			return;

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
	render: function() {
		var outHtml = null;

			var searchData = this.state.searchData;

			var Button = ReactBootstrap.Button;
			var ModalProduct5 = ReactBootstrap.Modal;
			var product_out_html=null;

			if(this.state.isShowProductSelect){
				product_out_html = 					
					<ModalProduct5  onRequestHide={this.closeProduct5Select}>
							<div className='modal-header light'>
									
								<div className="pull-right">
									<Button onClick={this.closeProduct5Select} className="btn-success"><i className="fa-check"></i> { } 確認送出</Button>
									<Button onClick={this.cancelProduct5Select}><i className="fa-times"></i> { } 取消</Button>
								</div>
								<h4 className="modal-title">請選擇產品(最多5樣)</h4>
							</div>
							<div className='modal-body'>
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
														<td className="text-center"><input type="checkbox" checked={itemData.is_take} onChange={this.setSelectProduct.bind(this,i)}/></td>
														<td>{itemData.product_sn}</td>
														<td>{itemData.product_name}</td>
													</tr>;
												return product_out_html;
											}.bind(this))
										}
									</tbody>
								</table>
							</div>
							<div className='modal-footer'>
								<Button onClick={this.closeProduct5Select} className="btn-success"><i className="fa-check"></i> { } 確認送出</Button>
								<Button onClick={this.cancelProduct5Select} className="btn-default"><i className="fa-times"></i> { } 取消</Button>
							</div>
					</ModalProduct5>;
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
								<div className="form-inline break">
									<div className="form-group">

										<label>日期區間</label>	{ }							
											<span className="has-feedback">
												<InputDate id="start_date" 
												onChange={this.changeGDValue} 
												field_name="start_date" 
												value={searchData.start_date} />
											</span>	{ }	
										<label>~</label> { }
											<span className="has-feedback">
												<InputDate id="end_date" 
												onChange={this.changeGDValue} 
												field_name="end_date" 
												value={searchData.end_date} />
											</span> { }
										{product_out_html}
				                        <label className="sr-only">客戶名稱</label> { }
										<input type="text" className="form-control" 
											value={searchData.customer_name}
											onChange={this.changeGDValue.bind(this,'customer_name')}
											placeholder="客戶名稱..." />
										<label className="sr-only">產品名稱</label> { }
										<span className="input-group">
											<input type="text" className="form-control" value={this.state.show_product} disabled/>
											<span className="input-group-btn">
												<button className="btn-default" type="button" onClick={this.showProduct5Select}><i className="fa-plus"></i> 選取產品</button>
											</span>
										</span>
										{ } 
									</div>
									<div className="form-group">
			                        	<label className="sr-only">客戶類別</label> { }
										<select className="form-control"
			                                    value={searchData.customer_type}
			                                    onChange={this.changeGDValue.bind(this,'customer_type')}>
			                                <option value="">客戶類別</option>
			                                <option value="1">店家</option>
			                                <option value="2">直客</option>
			                            </select>

			                            <label className="sr-only">通路級別</label> { }
			                            <select className="form-control"
			                                    value={searchData.channel_type}
			                                    onChange={this.changeGDValue.bind(this,'channel_type')}>
			                                <option value="">通路級別</option>
			                                <option value="1">即飲</option>
			                                <option value="2">外帶</option>
			                            </select>

			                         	<label className="sr-only">銷售等級</label> { }
			                            <select className="form-control"
			                                    value={searchData.evaluate}
			                                    onChange={this.changeGDValue.bind(this,'evaluate')}>
			                                <option value="">銷售等級</option>
			                                <option value="1">A</option>
			                                <option value="2">B</option>
			                                <option value="3">C</option>
			                            </select>

			                         	<label className="sr-only">客戶型態</label> { }
			                            <select className="form-control"
			                                    value={searchData.store_type}
			                                    onChange={this.changeGDValue.bind(this,'store_type')}>
			                                <option value="">客戶型態</option>
			                                <option value="1">LS</option>
			                                <option value="2">Beer Store</option>
			                                <option value="3">Dancing</option>
			                                <option value="4">Bar</option>
			                                <option value="5">Cafe</option>
			                                <option value="6">Bistro</option>
			                                <option value="7">Restaurant</option>
			                            </select>

			                         	<label className="sr-only">型態等級</label> { }
			                            <select className="form-control"
			                                    value={searchData.store_level}
			                                    onChange={this.changeGDValue.bind(this,'store_level')}>
			                                <option value="">型態等級</option>
			                                <option value="1">G</option>
			                                <option value="2">S</option>
			                                <option value="3">B</option>
			                            </select> { }
			                            <button className="btn-primary" type="submit"><i className="fa-search"></i>{ }搜尋</button> { }
			                        	<button className="btn-success" type="button" onClick={this.excelPrint} disabled={this.state.print_excel}><i className="fa-print"></i> 列印</button>
			                        </div>
								</div>
							</div>
						</div>
						<table>
							<thead>
								<tr>
									<th className="col-xs-2">產品名稱</th>
									<th className="col-xs-2">客戶名稱</th>
									<th className="col-xs-1">訂貨量</th>
									<th className="col-xs-1">客戶類別</th>
									<th className="col-xs-1">通路級別</th>
									<th className="col-xs-1">銷售等級</th>
									<th className="col-xs-1">客戶型態</th>
									<th className="col-xs-1">型態等級</th>
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