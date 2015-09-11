//主表單
var GirdForm = React.createClass({
	mixins: [React.addons.LinkedStateMixin], 
	getInitialState: function() {  
		return {
			gridData:[],
			fieldData:{},
			searchData:{city:null,country:null,word:null},
			edit_type:0,
			checkAll:false,
			set_visit_date: moment(Date()).format('YYYY-MM-DD'),
			customer_grid_data:{rows:[]},
			visit_grid_data:[],
			customerGridPageIndex:1,
			customerGridPageLast:0,
			checkDate:false,//檢查日期:今天以前true;今天、今天以後:false
			country_list:[]
		};  
	},
	getDefaultProps:function(){
		return{	
			fdName:'fieldData',
			gdName:'searchData',
			apiPathName:gb_approot+'api/Visit'
		};
	},
	componentWillMount:function(){
		this.queryCustomer();
		this.querySetVisit();
	},
	componentDidMount:function(){

	},
	handleSubmit: function(e) {

		e.preventDefault();
		if(this.state.edit_type==1){
			jqPost(this.props.apiPathName,this.state.fieldData)
			.done(function(data, textStatus, jqXHRdata) {
				if(data.result){
					alert('新增完成');
					this.setState({fieldData:{},show_insert_message:true});
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
	insertType:function(){
		this.setState({edit_type:1,fieldData:{}});
	},
	updateType:function(id){

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
		this.queryCustomer();
	},
	setFDValue:function(fieldName,value){
		//此function提供給次元件調用，所以要以屬性往下傳。
		var obj = this.state[this.props.fdName];
		obj[fieldName] = value;
		this.setState({fieldData:obj});
	},
	setInputValue:function(collentName,name,e){
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
	queryCustomer:function(){

		var parm = {
			visit_date:this.state.set_visit_date,
			page:this.state.customerGridPageIndex,
			city:this.state.searchData.city,
			word:this.state.searchData.word,
			country:this.state.searchData.country
		};

		jqGet(gb_approot+'api/GetAction/GetMyCustomer',parm)
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({customer_grid_data:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	querySetVisit:function(){
		jqGet(gb_approot+'api/GetAction/GetMyVisit',{visit_date:this.state.set_visit_date})
		.done(function(data, textStatus, jqXHRdata) {
			this.setState({visit_grid_data:data});
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},	
	addVisit:function(customer_id){
		jqPost(gb_approot + 'api/GetAction/SetVisit',{customer_id:customer_id,visit_date:this.state.set_visit_date})
		.done(function(data, textStatus, jqXHRdata) {
			this.queryCustomer();
			this.querySetVisit();
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	removeVisit:function(visit_detail_id){
		jqDelete(gb_approot + 'api/GetAction/RemoveVisit',{visit_detail_id:visit_detail_id})
		.done(function(data, textStatus, jqXHRdata) {
			this.queryCustomer();
			this.querySetVisit();
		}.bind(this))
		.fail(function(jqXHR, textStatus, errorThrown) {
			showAjaxError(errorThrown);
		});
	},
	visitDateChange:function(e){

			var v = e.target.value;

			if(v!=null && v!=undefined){

				var d = getNowDate();
				var n = new Date(e.target.value);
				if(n>=d){
					this.setState({set_visit_date:e.target.value,checkDate:false});
					this.state.set_visit_date = e.target.value;
					this.state.checkDate = false;
					this.queryCustomer();
					this.querySetVisit();
				}else{
					this.setState({set_visit_date:e.target.value,checkDate:true});
					this.state.set_visit_date = e.target.value;
					this.state.checkDate = true;
					this.queryCustomer();
					this.querySetVisit();
				}
			}

	},
	customerGridPrev:function(){
		if(this.state.customerGridPageIndex>1){
			this.state.customerGridPageIndex --;
			this.queryCustomer();
		}
	},
	customerGridNext:function() {
		if(this.state.customerGridPageIndex < this.state.customer_grid_data.total){
			this.state.customerGridPageIndex ++;
			this.queryCustomer();
		}
	},
	render: function() {
		var outHtml = null;
		var VisitCusomerHtml=null;
		var fieldData = this.state.fieldData;

		if(this.state.checkDate){
			VisitCusomerHtml=(
				<tbody>
					<tr>
						<th>店名</th>
						<th>縣市</th>
						<th>鄉鎮市</th>
						<th>地址</th>
					</tr>
					{
								this.state.customer_grid_data.rows.map(function(itemData,i) {
								var out_html =                     
											<tr key={itemData.customer_id}>
						                        <td>{itemData.customer_name}</td>
						                        <td>{itemData.tw_city}</td>
						                        <td>{itemData.tw_country}</td>
						                        <td>{itemData.tw_address}</td>
											</tr>;
										return out_html;
								}.bind(this))
					}
				</tbody>
				);
		}else{
			VisitCusomerHtml=(
				<tbody>
					<tr>
						<th>店名</th>
						<th>縣市</th>
						<th>鄉鎮市</th>
						<th>地址</th>
						<th className="text-center">加入</th>
					</tr>
					{
								this.state.customer_grid_data.rows.map(function(itemData,i) {
									var addHtml=null;
									if(itemData.mark_err){
										addHtml=(
													<span className="label label-danger">錯</span>
											);
									}else{
										addHtml=(
													<button className="btn btn-link btn-sm" type="button" 
													onClick={this.addVisit.bind(this,itemData.customer_id)}
													disabled={this.state.checkDate}>
														<i className="glyphicon glyphicon-plus"></i>
													</button>
											);										
									}
								var out_html =                     
											<tr key={itemData.customer_id}>
						                        <td>{itemData.customer_name}</td>
						                        <td>{itemData.tw_city}</td>
						                        <td>{itemData.tw_country}</td>
						                        <td>{itemData.tw_address}</td>
			                        			<td className="text-center">
			                        			{addHtml}
						                        </td>
											</tr>;
										return out_html;
								}.bind(this))
					}
				</tbody>
				);
		}

		outHtml=(
<div>

    <form action="" className="form-inline">
        <div className="form-group form-group-lg has-success">
            <label for="" className="control-label">
                預定拜訪日期
            </label>
            { } <input type="date" className="form-control" value={this.state.set_visit_date} onChange={this.visitDateChange} />
            { } <small className="help-inline text-muted">若輸入今天以前的日期，只能查看行程內容，無法加入或取消拜訪客戶。</small>
        </div>
    </form>

    <hr />

    <div className="row">

	    <div className="col-md-8">
	        <h4 className="pull-left">業務員所屬客戶名單</h4>
	        <form action="" className="table-form form-inline pull-left col-xs-offset-1">
	            <div className="form-group">
	                <select className="form-control" 
	                	value={this.state.searchData.city}
	                	onChange={this.changeGDValue.bind(this,'city')}>
	                    <option value="">全部縣市</option>
	                    {
							CommData.twDistrict.map(function(itemData,i) {
								var out_option = <option value={itemData.city} key={itemData.city}>{itemData.city}</option>;
								return out_option;
							}.bind(this))
						}
	                </select>
	               	<select className="form-control" 
	                	value={this.state.searchData.country}
	                	onChange={this.changeGDValue.bind(this,'country')}>
	                    <option value="">鄉鎮市區</option>
						{
								this.state.country_list.map(function(itemData,i) {
								return <option key={itemData.county} value={itemData.county}>{itemData.county}</option>;
							})
						}
	                </select>
	            </div>
	            <div className="form-group">
	                <input type="text" placeholder="店名/客編" 
	                className="form-control" 
	                value={this.state.searchData.word} 
	                onChange={this.changeGDValue.bind(this,'word')}
	                />
	            </div>
	        </form>
	        <div className="clearfix"></div>

			<table className="table table-bordered table-striped table-condensed">
			{VisitCusomerHtml}
			</table>
			<div className="form-inline text-center">
				<ul className="pager list-inline list-unstyled">
					<li><a href="#" onClick={this.customerGridPrev}><i className="glyphicon glyphicon-arrow-left"></i> 上一頁</a></li>
					<li><a href="#" onClick={this.customerGridNext}>下一頁 <i className="glyphicon glyphicon-arrow-right"></i></a></li>
				</ul>
			</div>
	    </div>

	    <hr className="hidden-md hidden-lg" />

	    <div className="col-md-4">
	        <h4 className="pull-left">已排定行程</h4>
	        <form action="" className="table-form form-inline pull-left col-xs-offset-1">
	        </form>
	        <div className="clearfix"></div>

	            <table className="table table-bordered table-striped table-condensed">
	            	<tbody>
						<tr>
							<th>店名</th>
							<th>拜訪狀態</th>
							<th className="text-center">刪除</th>
						</tr>
						{
							this.state.visit_grid_data.map(function(itemData,i) {
								var out_html =                     
									<tr key={itemData.visit_detail_id}>
				                        <td>{itemData.customer_name}</td>
										<td>
											<StateForGrid stateData={CommData.VisitDetailState} id={itemData.state} />
										</td>
	                        			<td className="text-center">
											<button className="btn btn-link btn-sm" 
											type="button" 
											onClick={this.removeVisit.bind(this,itemData.visit_detail_id)}
											disabled={itemData.state!=1 || this.state.checkDate}
											>
												<i className="glyphicon glyphicon-remove"></i>
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
</div>
		);
		return outHtml;
	}
});