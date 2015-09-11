//主表單
var GirdForm = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function () {
        return {
            gridData: [],
            fieldData: {},
            searchData: { title: null },
            edit_type: 0,
            checkAll: false,
            gridProdcut: [],
            set_visit_date: moment(Date()).format('YYYY-MM-DD'),
            view_type: 1, // 1:拜訪|2:檢視
            memo: null,
            no_visit_reason: 0
        };
    },
    getDefaultProps: function () {
        return {
            fdName: 'fieldData',
            gdName: 'searchData',
            apiPathName: gb_approot + 'api/Customer'
        };
    },
    componentDidMount: function () {

        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            if (e.target.id == 'tabAddView') {
                this.setState({ show_insert_message: false });
                this.queryTodayCustomer();
            }
        }.bind(this));
        $('a[href="#product"]').on('click', function (e) {
            this.updateCustomer(e);
        }.bind(this));

        this.queryCustomerByVisitDetail();
        this.queryVisitProduct();
    },
    queryVisitProduct: function () {
        jqGet(gb_approot + 'api/GetAction/GetVisitProduct', { visit_detail_id: gb_visit_detail_id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridProdcut: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    updateCustomer: function (e) {
        //e.preventDefault();
        var fieldData=this.state.fieldData;
        if(fieldData.tel=="" || fieldData.tel==null){
            alert("電話欄位不可空白!");
            return;
        }
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
        this.updateVisitDetail();
        jqPut(gb_approot + 'api/Customer', this.state.fieldData)
		.done(function (data, textStatus, jqXHRdata) {
            if(!data.result){
                alert(data.message);
            }else{
                $('#ProductInfo').tab('show');
            }
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
        return;
    },
    updateVisitDetail: function () {
        jqPut(gb_approot + 'api/GetAction/updateVisitDetail', { visit_detail_id: gb_visit_detail_id, no_visit_reason: this.state.no_visit_reason, memo: this.state.memo })
		.done(function (data, textStatus, jqXHRdata) {
		    if (data.result) {
		    } else {
		        alert(data.message);
		    }
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    pauseCustomer: function (e) {
        e.preventDefault();
        jqPut(gb_approot + 'api/GetAction/PutPauseCustomer', { visit_detail_id: gb_visit_detail_id })
		.done(function (data, textStatus, jqXHRdata) {
		    if (data.result) {
		        document.location.href = gb_approot + 'Active/Tablet/Visit_list';
		    }
		    else {
		        alert(data.message);
		    }
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
        return;
    },
    handleSubmit: function (e) {

        e.preventDefault();
        if (this.state.edit_type == 1) {
            jqPost(this.props.apiPathName, this.state.fieldData)
			.done(function (data, textStatus, jqXHRdata) {
			    if (data.result) {
			        alert('新增完成');
			        this.setState({ fieldData: {}, show_insert_message: true });
			    } else {
			        alert(data.message);
			    }
			}.bind(this))
			.fail(function (jqXHR, textStatus, errorThrown) {
			    showAjaxError(errorThrown);
			});
        }
        else if (this.state.edit_type == 2) {
            jqPut(this.props.apiPathName, this.state.fieldData)
			.done(function (data, textStatus, jqXHRdata) {
			    if (data.result) {
			        alert('修改完成');
			    } else {
			        alert(data.message);
			    }
			}.bind(this))
			.fail(function (jqXHR, textStatus, errorThrown) {
			    showAjaxError(errorThrown);
			});
        };
        return;
    },
    deleteSubmit: function (e) {

        if (!confirm('確定是否刪除?')) {
            return;
        }

        var ids = [];
        for (var i in this.state.gridData.rows) {
            if (this.state.gridData.rows[i].check_del) {
                ids.push('ids=' + this.state.gridData.rows[i].customer_id);
            }
        }

        if (ids.length == 0) {
            tosMessage(null, '未選擇刪除項', 2);
            return;
        }

        jqDelete(this.props.apiPathName + '?' + ids.join('&'), {})
		.done(function (data, textStatus, jqXHRdata) {
		    if (data.result) {
		        tosMessage(null, '刪除完成', 1);
		        this.queryGridData(0);
		    } else {
		        alert(data.message);
		    }
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    handleSearch: function (e) {
        e.preventDefault();
        this.queryGridData(0);
        return;
    },
    delCheck: function (i, chd) {

        var newState = this.state;
        this.state.gridData.rows[i].check_del = !chd;
        this.setState(newState);
    },
    checkAll: function () {

        var newState = this.state;
        newState.checkAll = !newState.checkAll;
        for (var prop in this.state.gridData.rows) {
            this.state.gridData.rows[prop].check_del = newState.checkAll;
        }
        this.setState(newState);
    },
    gridData: function (page) {

        var parms = {
            page: 0
        };

        if (page == 0) {
            parms.page = this.state.gridData.page;
        } else {
            parms.page = page;
        }

        $.extend(parms, this.state.searchData);

        return jqGet(this.props.apiPathName, parms);
    },
    queryGridData: function (page) {
        this.gridData(page)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    insertType: function () {
        this.setState({ edit_type: 1, fieldData: {} });
    },
    updateType: function (id) {
        jqGet(this.props.apiPathName, { id: id })
		.done(function (data, textStatus, jqXHRdata) {

		    this.setState({ edit_type: 2, fieldData: data.data });
		    $('#tabAddNew').tab('show');
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    noneType: function () {
        this.gridData(0)
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ edit_type: 0, gridData: data });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    changeFDValue: function (name, e) {
        this.setInputValue(this.props.fdName, name, e);
    },
    changeGDValue: function (name, e) {
        this.setInputValue(this.props.gdName, name, e);
    },
    setFDValue: function (fieldName, value) {
        //此function提供給次元件調用，所以要以屬性往下傳。
        var obj = this.state[this.props.fdName];
        obj[fieldName] = value;
        this.setState({ fieldData: obj });
    },
    setProductValue: function (index, fieldName, e) {
        var regex = new RegExp("^\\d+(\\.\\d+)?$");//只能輸入整數及小數
        if (fieldName == "price") {
            if (regex.test(e.target.value)) {//判斷是否格式正確值才會改變
                var obj = this.state.gridProdcut
                obj[index][fieldName] = e.target.value;
                this.setState({ gridProdcut: obj });
            } else {
                alert("本欄位為數字格式，請輸入數字!");
            }
        } else {
            var obj = this.state.gridProdcut
            obj[index][fieldName] = e.target.value;
            this.setState({ gridProdcut: obj });
        }

    },
    setInputValue: function (collentName, name, e) {

        var obj = this.state[collentName];
        if (e.target.value == 'true') {
            obj[name] = true;
        } else if (e.target.value == 'false') {
            obj[name] = false;
        } else {
            obj[name] = e.target.value;
        }
        this.setState({ fieldData: obj });
    },
    setReasonValue: function (e) {
        this.state.no_visit_reason = e.target.value;
        this.setState({ no_visit_reason: e.target.value });
    },
    setMemoValue: function (e) {
        this.state.memo = e.target.value;
        this.setState({ memo: e.target.value });
    },
    queryCustomerByVisitDetail: function () {
        jqGet(gb_approot + 'api/GetAction/GetCustomerByVisitDetail', { visit_detail_id: gb_visit_detail_id })
		.done(function (data, textStatus, jqXHRdata) {
		    this.setState({ fieldData: data.Customer, memo: data.memo, no_visit_reason: data.no_visit_reason });
		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    setVisitFinish: function () {
        var fieldData=this.state.fieldData;
        if(fieldData.tel=="" || fieldData.tel==null){
            alert("電話欄位不可空白!");
            return;
        }
        jqPut(gb_approot + 'api/GetAction/FinishVisit', { visit_detail_id: gb_visit_detail_id, proudcts: this.state.gridProdcut })
		.done(function (data, textStatus, jqXHRdata) {
		    if (data.result) {
		        alert('完成拜訪');
		        document.location.href = gb_approot + 'Active/Tablet/Visit_list';
		    } else {
		        alert(data.message);
		    }

		}.bind(this))
		.fail(function (jqXHR, textStatus, errorThrown) {
		    showAjaxError(errorThrown);
		});
    },
    focusSelect: function (e) {//選到價格是值要全選
        e.target.select();
    },
    render: function () {
        var outHtml = null;
        var fieldData = this.state.fieldData;
        var out_nowText = null;
        if (this.state.view_type == 1) {
            out_nowText = (<label className="control-label">正在拜訪</label>);
        } else {
            out_nowText = (<label className="control-label">正在瀏覽</label>);
        }

        outHtml = (
			<div>
			<form className="form-inline">
				<div className="form-group form-group-lg has-success col-sm-margin-right">
					<label for="" className="control-label">日期</label> { }
					<input type="text" value={this.state.set_visit_date} className="form-control" disabled />
				</div>
				<div className="form-group form-group-lg has-success">
				    {out_nowText} { }
					<input type="text" value={this.state.fieldData.customer_name} className="form-control" disabled />
				</div>
			</form>
			<hr />
			<div role="tabpanel">
			<ul className="nav nav-tabs" role="tablist">
				<li role="presentation" className="active">
					<a href="#profile" aria-controls="home" role="tab" data-toggle="tab" id="CustomerData">
						<i className="glyphicon glyphicon-user"></i> 客戶資料
					</a>
				</li>
				<li role="presentation">
					<a href="#product" aria-controls="profile" role="tab" data-toggle="tab" id="ProductInfo">
						<i className="glyphicon glyphicon-glass"></i> 產品分布
					</a>
				</li>
			</ul>
			<div className="tab-content">
			<div role="tabpanel" className="tab-pane active" id="profile">
				<form action="" className="form-horizontal">
					<div className="col-md-12">
						<div className="form-group">
							<div className="col-md-3 col-md-offset-9 text-right">
								<button type="button" onClick={this.pauseCustomer} className="btn btn-danger">
								    暫停(不存檔)
								</button>
								<button type="button" onClick={this.updateCustomer} className="btn btn-success">
									<i className="glyphicon glyphicon-arrow-right"></i> 存檔，下一步
								</button>
							</div>
						</div>
					</div>
					<div className="col-md-12">
						<div className="form-group">
							<label for="" className="control-label col-md-1 col-xs-2">客戶拜訪<br />說明</label>
							<div className="col-md-11 col-xs-10">
								<textarea cols="30" rows="2" className="form-control" value={this.state.memo} onChange={this.setMemoValue}></textarea>
							</div>
						</div>
					</div>
					<div className="col-md-6">
						<div className="form-group">
							<label for="" className="control-label col-xs-2">客戶編號</label>
							<div className="col-xs-4">
								<input type="text" className="form-control"
                                       value={fieldData.customer_sn}
                                       disabled={true} />
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
                                   address_field="tw_address" />
						<div className="form-group">
							<label for="" className="control-label col-xs-2 text-danger">電話</label>
							<div className="col-xs-4">
								<input type="text" className="form-control"
                                       value={fieldData.tel}
                                       onChange={this.changeFDValue.bind(this,'tel')}
                                       maxLength="16"
                                       required />
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
						<label for="" className="control-label col-xs-2 text-danger">區域群組</label>
							<div className="col-xs-4">
								<select className="form-control"
                                        value={fieldData.area_id}
                                        onChange={this.changeFDValue.bind(this,'area_id')}>
                                    <option value="1">北一區</option>
                                    <option value="2">北二區</option>
                                    <option value="3">中區</option>
                                    <option value="4">南區</option>
									<option value="5">花東區</option>
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

							<label className="control-label col-xs-2">通路別</label>
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
						    {/*<label for="" className="control-label col-xs-2">直客</label>
							<div className="col-xs-4">
								<select name="" id="" className="form-control">
									<option value="">是</option>
								</select>
							</div>*/}
							<label for="" className="control-label col-xs-2">未訪原因</label>
							<div className="col-xs-4">
								<select className="form-control" value={this.state.no_visit_reason}
                                        onChange={this.setReasonValue}>
									<option value="0"></option>
									<option value="1">尚未營業</option>
									<option value="2">歇業</option>
								</select>
							</div>
							<label for="" className="control-label col-xs-2">排序</label>
							<div className="col-xs-4">
								<input type="number" className="form-control"
                                       value={fieldData.sort}
                                       onChange={this.changeFDValue.bind(this,'sort')} />
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
		                    	<ol>
                                    <li><strong className="text-danger">紅色標題</strong> 為必填欄位。</li>
		                    		<li>地址格式請依照郵局格式填寫，地址<strong className="text-danger">段</strong>以前請勿填寫阿拉伯數字。</li>
		                    		<li>點選暫停 <strong className="text-danger"> 不會存檔</strong>。</li>
		                    	</ol>
		                    </div>
		                </div>
					</div>
				</form>
			</div>

			<div role="tabpanel" className="tab-pane" id="product">

			<form action="" className="form-horizontal">
				<div className="col-md-12">
					<div className="form-group">
						<div className="col-md-3 col-md-offset-9 text-right">
							<button type="button" onClick={this.pauseCustomer} className="btn btn-danger">暫停(不存檔)</button>
							<button type="button" onClick={this.setVisitFinish} className="btn btn-success">
								<i className="glyphicon glyphicon-ok"></i> 完成拜訪
							</button>
						</div>
					</div>
				</div>
				<div className="col-xs-12">
                    <div className="form-group">
                        <div className="col-md-3 col-xs-6">品名</div>
                        <div className="col-md-1 col-xs-2">售價</div>
                        <div className="col-md-2 col-xs-4">備註</div>
                        <div className="col-md-3 col-xs-6 hidden-sm hidden-xs">品名</div>
                        <div className="col-md-1 col-xs-2 hidden-sm hidden-xs">售價</div>
                        <div className="col-md-2 col-xs-4 hidden-sm hidden-xs">備註</div>
                    </div>
				</div>
			    {
			    this.state.gridProdcut.map(function(itemData,i) {
			    var out_html =
					<div className="col-md-6 col-xs-12" key={itemData.product_id}>
						<div className="form-group">
						    <div className="col-xs-6">
						    	<input type="text" className="form-control" value={itemData.product_name} disabled={true} />
						    </div>
                        	<div className="col-xs-2">
                        		<input type="number" className="form-control" value={itemData.price} onChange={this.setProductValue.bind(this,i,'price')} onClick={this.focusSelect.bind(this)} />
                        	</div>
                        	<div className="col-xs-4">
                        		<input type="text" className="form-control" value={itemData.description} onChange={this.setProductValue.bind(this,i,'description')} />
                        	</div>
						</div>
					</div>;
			    return out_html;
			    }.bind(this))
			    }

					<div className="col-xs-12">
		                <div className="form-group">
		                    <div className="alert alert-warning">
		                    	<p>點選暫停 <strong className="text-danger">不會存檔</strong>。</p>
		                    </div>
		                </div>
					</div>
			</form>
			</div>
			</div>
			</div>
			</div>
		);
        return outHtml;
    }
});