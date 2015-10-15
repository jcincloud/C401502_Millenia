//主表單
var GirdForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			fieldData:{a_customer_id:null,b_customer_id:null},
			tableData:[	{name:'VisitDetail',isHaveData:false},
						{name:'VisitDetailProduct',isHaveData:false},
						{name:'VisitTimeRecorder',isHaveData:false},
						{name:'StockDetailQty',isHaveData:false}],
			select_type:1,
			customer_list:[],
			isShowCustomerSelect:false,
			searchCustomer:{},
			country_list:[],
			now_select:null,
			isHaveData:false
		};  
	},
	getDefaultProps:function(){
		return{	
		};
	},
	changeTypeValue:function(e){
		this.setState({select_type:e.target.value});
	},
	setInputValue:function(name,e){
		var obj = this.state.fieldData;
		obj[name] = e.target.value;

		this.setState({fieldData:obj});
	},
	setSearchValue:function(name,e){
		if(name=='city'){
			this.listCountry(e.target.value);
		}
		var obj = this.state.searchCustomer;
		if(e.target.value=='true'){
			obj[name] = true;
		}else if(e.target.value=='false'){
			obj[name] = false;
		}else{
			obj[name] = e.target.value;
		}
		this.setState({searchCustomer:obj});
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
	queryAllCustomer:function(){//選取用餐編號-取得未使用的用餐編號List
		jqGet(gb_approot + 'api/GetAction/GetAllCustomerByC',this.state.searchCustomer)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({customer_list:data});
		}.bind(this))
		.fail(function( jqXHR, textStatus, errorThrown ) {
			showAjaxError(errorThrown);
		});		
	},
	showSelectCustomer:function(name){
		this.setState({isShowCustomerSelect:true,now_select:name});
	},
	closeSelectCustomer:function(){
		this.setState({isShowCustomerSelect:false});
	},
	selectCustomer:function(id){
		var fieldData = this.state.fieldData;//選取後變更客戶編號
		fieldData[this.state.now_select]=id;
		if(this.state.now_select=='a_customer_id'){
			jqGet(gb_approot + 'api/GetAction/GetTableData',{customer_id:id})
			.done(function(data, textStatus, jqXHRdata) {			
				this.setState({isShowCustomerSelect:false,fieldData:fieldData,tableData:data.datas,isHaveData:data.isHaveData});
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});	
		}else{
			this.setState({isShowCustomerSelect:false,fieldData:fieldData});
		}

	},
	noneType:function(){
		var fieldData=this.state.fieldData;
		var tableData=this.state.tableData;

		tableData=[	{name:'VisitDetail',isHaveData:false},
					{name:'VisitDetailProduct',isHaveData:false},
					{name:'VisitTimeRecorder',isHaveData:false},
					{name:'StockDetailQty',isHaveData:false}];
		fieldData={a_customer_id:null,b_customer_id:null};

		this.setState({fieldData:fieldData,tableData:tableData});
	},
	handleSearchCustomer:function(){
  		this.queryAllCustomer();
	},
	handleSubmit: function(e) {

		e.preventDefault();
		var fieldData=this.state.fieldData;


		if(this.state.select_type==1){
			if(fieldData.a_customer_id==null || fieldData.b_customer_id==null ){
				tosMessage(gb_title_from_invalid,'未選取A客戶或B客戶!!',3);
				return;
			}
			if(!this.state.isHaveData){
				tosMessage(gb_title_from_invalid,'A客戶未有相關資料不需轉換!!',3);
				return;
			}
			if(!confirm('確定是否移轉?')){
				return;
			}
			jqPost(gb_approot + 'api/GetAction/PostChangeCustomerData',fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					tosMessage(null,'移轉完成',1);
					this.noneType();
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}else if(this.state.select_type==2){
			if(fieldData.a_customer_id==null){
				tosMessage(gb_title_from_invalid,'未選取A客戶!!',3);
				return;
			}
			if(!confirm('確定是否刪除?')){
				return;
			}
			jqPost(gb_approot + 'api/GetAction/deleteCustomerData',fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					tosMessage(null,'刪除完成',1);
					this.noneType();
				}else{
					tosMessage(null,data.message,3);
				}
			}.bind(this))
			.fail(function( jqXHR, textStatus, errorThrown ) {
				showAjaxError(errorThrown);
			});
		}

		return;
	},
	render: function() {
		var outHtml = null;
		var detail_html=null;
		var fieldData=this.state.fieldData;
		var searchCustomer=this.state.searchCustomer;

		var MdoalSelectCustomer = ReactBootstrap.Modal;
		var customer_out_html = null;
			if(this.state.isShowCustomerSelect){
				customer_out_html = 					
					<MdoalSelectCustomer title="選取客戶對應" onRequestHide={this.closeSelectCustomer}>
							<div className='modal-body'>
							<div className="table-header">
								<div className="table-filter">
									<div className="form-inline">
				                        <div className="form-group">
				                            <input type="text" className="form-control input-sm" placeholder="店名/客編"
				                           	value={searchCustomer.word} 
	                						onChange={this.setSearchValue.bind(this,'word')} /> { }
				                            <select name="" id="" className="form-control input-sm"
				                            onChange={this.setSearchValue.bind(this,'area')}
											value={searchCustomer.area}> { }
				                                <option value="">區域群組</option>
											{
												CommData.AreasData.map(function(itemData,i) {
													return <option key={itemData.id} value={itemData.id}>{itemData.label}</option>;
												})
											}
				                            </select> { }
				                            <select name="" id="" className="form-control input-sm"
				                       		onChange={this.setSearchValue.bind(this,'city')}
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
													onChange={this.setSearchValue.bind(this,'country')}>
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
											this.state.customer_list.map(function(itemData,i) {
												var customer_out_html=                   
													<tr key={itemData.customer_id}>
														<td className="text-center"><input type="checkbox" checked={itemData.is_take} onChange={this.selectCustomer.bind(this,itemData.customer_id)} /></td>
														<td>{itemData.customer_name}</td>
													</tr>;
												return customer_out_html;
											}.bind(this))
										}
									</tbody>
		        				</table>
							</div>
							<div className='modal-footer'>
								<button onClick={this.closeSelectCustomer}><i className="fa-times"></i> { } 取消</button>
							</div>
					</MdoalSelectCustomer>;
			}

			if(this.state.select_type==1){
				detail_html=
				<form className="form-horizontal clearfix" onSubmit={this.handleSubmit}>
					<div className="col-xs-12">
						<div className="form-group"></div>
						<div className="form-group"></div>
						<div className="form-group">
						<label className="col-xs-10 text-center text-danger">將A客戶相關資料移轉至B客戶</label>
						</div>
						<div className="form-group"></div>
						<div className="form-group">
							<label className="col-xs-2 control-label">A客戶</label>
							<div className="col-xs-2">
								<div className="input-group">
				            		<input type="text" 
									className="form-control"	
									value={fieldData.a_customer_id}
									onChange={this.setInputValue.bind(this,'a_customer_id')}
									required disabled/>
			            			<span className="input-group-btn">
			            				<a className="btn"
										onClick={this.showSelectCustomer.bind(this,'a_customer_id')}>
										<i className="fa-plus"></i>
										</a>
			            			</span>
			            		</div>
							</div>
							<div className="col-xs-2 text-center">
								<button type="submit"><i className="fa-long-arrow-right"></i></button>
							</div>
							<div className="col-xs-4">
								<label className="col-xs-2 control-label">B客戶</label>
								<div className="input-group col-xs-6">
				            		<input type="text" 
									className="form-control"	
									value={fieldData.b_customer_id}
									onChange={this.setInputValue.bind(this,'b_customer_id')}
									required disabled/>
			            			<span className="input-group-btn">
			            				<a className="btn"
										onClick={this.showSelectCustomer.bind(this,'b_customer_id')}>
										<i className="fa-plus"></i>
										</a>
			            			</span>
			            		</div>
							</div>
						</div>
					</div>
				</form>;
			}else if(this.state.select_type==2){
				detail_html=
				<form className="form-horizontal clearfix" onSubmit={this.handleSubmit}>
					<div className="col-xs-12">
						<div className="form-group"></div>
						<div className="form-group"></div>
						<div className="form-group">
						<label className="col-xs-10 text-center text-danger">將A客戶及A客戶相關資料刪除</label>
						</div>
						<div className="form-group"></div>
						<div className="form-group">
							<label className="col-xs-2 control-label">A客戶</label>
							<div className="col-xs-2">
								<div className="input-group">
				            		<input type="text" 
									className="form-control"	
									value={fieldData.a_customer_id}
									onChange={this.setInputValue.bind(this,'a_customer_id')}
									required disabled/>
			            			<span className="input-group-btn">
			            				<a className="btn"
										onClick={this.showSelectCustomer.bind(this,'a_customer_id')}>
										<i className="fa-plus"></i>
										</a>
			            			</span>
			            		</div>
							</div>
							<div className="col-xs-2 text-center">
								<button className="btn-danger" onClick={this.deleteCustomerData}><i className="fa-trash"></i></button>
							</div>
						</div>
					</div>
				</form>;
			}

			outHtml =
			(
			<div>
				{customer_out_html}
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
								<label>選擇功能</label> { }
								<select className="form-control" 
										onChange={this.changeTypeValue.bind(this)}
										value={this.state.select_type}>
									<option value="1">移轉客戶相關資料</option>
									<option value="2">刪除客戶和客戶相關資料</option>
								</select>
							</div> { }
						</div>
					</div>
				</div>

				{detail_html}

				<div className="row">
					<div className="col-xs-2"></div>
					<div className="col-xs-2">
						<div className="table-responsive">
							<table className="table-condensed">
								<caption>A客戶相關資料</caption>
								<tbody>
									<tr>
										<th>有無資料</th>
					                	<th className="text-center">資料表名稱</th>
									</tr>
									{
										this.state.tableData.map(function(itemData,i) {
											var out_sub_html =                     
												<tr key={i}>
							                        <td className="text-center">
							                        {itemData.isHaveData?<span className="label label-primary">有</span>:<span className="label label-default">無</span>}
							                        </td>
				                        			<td className="text-center">{itemData.name}</td>
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
        				</div>
        			</div>
				</div>

			</div>
			);

		return outHtml;
	}
});