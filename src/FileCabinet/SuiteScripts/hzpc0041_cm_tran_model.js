/**
 * @NApiVersion 2.1
 */
const PAGE_SIZE = 50;
const CLIENT_SCRIPT_FILE_ID = "hzpc0041_cs_pagination_builder.js";
const deploymentId = "customdeployhzpc0041_sl_net_receivables_";
const scriptId ='customscript_hzpc0041_sl_net_receivables';
const searchId = 'customsearch_hzpc_net_rec_pay_2';
const mapreduceSCript = ['customscript_hzpc0041_mr_net_journal', 'customdeploy_hzpc0041_mr_net_journal'];
let defaults={};
let salesTran=[{'CustInvc':'Invoice'},{"CustCred":'Credit Memo'},{'CustPymt':'Payment'}];
let purchTran  =[{'VendBill':'Bill'},{'VendCred':'Bill Credit'},{'VendPymt':'Bill Payment'}]
let recordType={"Invoice":'invoice',"Credit Memo":'creditmemo',"Payment":'customerpayment',"Bill":'vendorbill',"Bill Credit":'vendorcredit',"Bill Payment":'vendorpayment'};
define(['N/search', 'N/record', 'N/url', 'N/ui/serverWidget', 'N/task', 'N/redirect','N/runtime','../library/hzpc0041_cm_global_functions'],

	(search, record, url, serverWidget, task, redirect,runtime, globals) => {

		const handleGetOperation = (context) => {
			const functionName = "handleGetOperation";
			try {
				return buildNettingForm(context);
			} catch (ex) {
				let errorStr = (ex.name != null) ? ex.name + '</br>' + ex.message + '</br>' + ex.stack + '</br>' : ex.toString();
				log.error('Error',
					`A problem occured whilst : <br>${errorStr}<br>functionName>>>>${functionName}`);

			}
		}

		const handlePostOperation = (context) => {
			const functionName = "handlePostOperation";
			let processStr = "";
			let self = this;

			try {
				var request = context.request;
				var count = request.getLineCount({group: 'custpage_hzpc0041_sublist'});
				var jsonObj = {};
				var processIds = [];
				for (var i = 0; i < count; i++) {
					var isMarked = request.getSublistValue({
						group: 'custpage_hzpc0041_sublist',
						name: 'custpage_hzpc0041_select',
						line: i
					});
					var recordID = request.getSublistValue({
						group: 'custpage_hzpc0041_sublist',
						name: 'custpage_id',
						line: i
					});
					if (isMarked == "T" || isMarked == true) {
						processIds.push(recordID)
					}
				}
               let jeNum='JE_'+new Date().getTime();
					log.debug('jeNum', jeNum);
				if (processIds.length > 0) {
					let transactionForm = serverWidget.createForm({
						title: 'Net Receivables Payables Transactions Status'
					});
					let idsJson = JSON.stringify(jsonObj = {
						'ids': processIds
					});
					let scheduledScriptTask = task.create({
						taskType: task.TaskType.MAP_REDUCE,
						scriptId: mapreduceSCript[0],
						deploymentId: mapreduceSCript[1],
						params: {
							custscript_hzpc_script_parameter: idsJson,
                          custscript_hzpc_script_je:jeNum
						}
					});
					let taskId = scheduledScriptTask.submit();
					log.debug('Submitted Task Id', taskId);
				}
				redirect.toSuitelet({
					scriptId: scriptId,
					deploymentId: deploymentId,
					parameters: {
						'run': 'T',
                       'jeNum':jeNum
					}
				});
				//context..writePage(transactionForm);
			} catch (ex) {
				let errorStr = (ex.name != null) ? ex.name + '</br>' + ex.message + '</br>' + ex.stack + '</br>' : ex.toString();
				log.error('Error',
					`A problem occured whilst ${processStr}: <br>${errorStr}<br>functionName>>>>${functionName}`);

			}
		}
		/** Builds the transaction form with fields, sublists, tabs etc..... */
		const buildNettingForm = (context) => {
			const functionName = "buildNettingForm";
			let processStr = "";
			let self = this;
			try {
				// Get the filter parameters from the URL
				const params = context.request.parameters;
				let currScript = runtime.getCurrentScript();
				let currUser = runtime.getCurrentUser();
				let usersubsidiary=currUser.subsidiary;
				const searchid=currScript.getParameter('custscript_hzpc_search_net_search');
				let pageId = parseInt(params.page);
				let tringgMr = params.run;
				let type = params.type;
				let account = params.account;
				let period = params.period;
				if(!period){period=''}
				let date = params.date;
				let duedate = params.duedate;
				let customer = params.cust;
				let action = params.action;
				let ar_tratype=params.ar_tratype
				let ap_tratype=params.ap_tratype
				let selectsubsidiary=params.subsidiary;
                let netJE=params.jeNum;
				let {
					script: scriptId,
					deploy: deploymentId,
					subsidiary,
				} = params;

				// Utilize server widget components and build the custom bulk transactions page.
				let transactionForm = serverWidget.createForm({
					title: 'Net Receivables Payables Transactions'
				});

				// Attach client script to the form for pagination and button actions
				transactionForm.clientScriptModulePath = './hzpc0041_cs_pagination_builder.js';
				
				if(selectsubsidiary){
					defaults['selectedsubsidiary']=selectsubsidiary;
				}else{
					defaults['selectedsubsidiary']=usersubsidiary;

				}
				let apselectTratype=[];
				let arselectTratype=[];

				if(ap_tratype){
					apselectTratype=ap_tratype.split(",");
				}
				if(ar_tratype){
					arselectTratype=ar_tratype.split(",");
				}
				defaults['apselectTratype']=apselectTratype;
				defaults['arselectTratype']=arselectTratype;
				defaults["selectedaccount"]=account;
				defaults["selectedperiod"]=period;
				defaults["selecteddate"]=date;
				defaults["selectedduedate"]=duedate;
				defaults["selectedcustomer"]=customer;
				let salesTrantype=[];
				let purachTrantype=[];
				let growers = [];
				salesTrantype.push({  value: '',  text: ''});
				for( let k in salesTran) {
					salesTrantype.push({ value: Object.keys(salesTran[k]).toString(),  text: Object.values(salesTran[k]).toString()});
				}
				purachTrantype.push({  value: '',  text: ''});

				for( let p in purchTran) {
					purachTrantype.push({  value: Object.keys(purchTran[p]).toString(),  text: Object.values(purchTran[p]).toString()});
				}
				growers = getRelationCustomer();
				defaults["growers"]=growers;
				
				defaults["purachTrantype"]=purachTrantype;
				defaults["salesTrantype"]=salesTrantype;

				let formDefinition = createFormDefinitions(defaults);
				if (tringgMr == 'T') {
					// Add fields to the form
                  //
                  
					globals.addFields(transactionForm, formDefinition.postfields);
					// Add custom buttons
					globals.addButtons(transactionForm, formDefinition.refreshbutton);
                  //addSublists
                 let postsublist= globals.addSublists(transactionForm, formDefinition.postsublists);

					let taskStatus = globals.getStatus(mapreduceSCript[0]);
					transactionForm.updateDefaultValues({
						custpage_task_submit: tringgMr,
						custpage_task_status: taskStatus["status"],
                      custpage_net_journal:netJE
					});
                     let searchObj=netJournal(netJE);
                  if(searchObj){
                    addPostsublist(searchObj,postsublist);}
					if(taskStatus["status"]=='COMPLETE'){
						// Add custom buttons
						transactionForm.addButton({
							id: 'custpage_goto_home',
							label: 'Go Back',
							functionName: 'gotohome('+scriptId+','+deploymentId+')'
						});
					}
				} else {
					globals.addSubTabs(transactionForm,formDefinition.subtabs);
					// Add fields to the form
					globals.addFields(transactionForm, formDefinition.fields);
					// Add sublists to the form
					let customSublist = globals.addSublists(transactionForm, formDefinition.sublists);

					// Add Submit button
					let submitButton = formDefinition.submitButton;

					if (submitButton) {
						transactionForm.addSubmitButton({
							id: submitButton.id,
							label: submitButton.label
						});
					}
					// Add custom buttons
					globals.addButtons(transactionForm, formDefinition.buttons);

					let eventListener = formSubmitListener(params);
					addDefaultValues(transactionForm, params);
					if(action=='submit'){

						let searchPageSize = PAGE_SIZE;
						let searchObj = runSearch();
						let tranResultCount = searchObj.runPaged().count;
						if(tranResultCount>0){
							let resultSet=searchObj.runPaged({pageSize: searchPageSize});

							let resultCount = resultSet.count;

							let pageCount = Math.ceil((resultCount / searchPageSize));

							let current_page_Id = getPageId(pageId, pageCount);

							let paginationObject = {
								"pageId": current_page_Id,
								"pageCount": pageCount,
								"pageSize": searchPageSize,
								"scriptId": scriptId,
								"deploymentId": deploymentId,
								"transactionForm": transactionForm
							}

							addPaginationWidgets(paginationObject);
							let addResults = fetchTransactionData(resultSet, current_page_Id);
							// Set data returned to columns in the UI
							addColumnsToSublist(addResults, customSublist);
						}
					}
				}
				context.response.writePage(transactionForm);
			} catch (ex) {
				let errorStr = (ex.name != null) ? ex.name + '</br>' + ex.message + '</br>' + ex.stack + '</br>' : ex.toString();
				log.error('Error',
					`A problem occured whilst : <br>${errorStr}<br>functionName>>>>${functionName}`);

			}
		}

		const getRelationCustomer = () =>{
			try{
				let results =[];
				const customerSearchColInternalId = search.createColumn({ name: 'internalid' });
				const customerSearchColId = search.createColumn({ name: 'entityid', sort: search.Sort.ASC });
				const customerSearchColName = search.createColumn({ name: 'altname' });
				const customerSearch = search.create({
				  type: 'customer',
				  filters: [
				    ['otherrelationships', 'anyof', 'Vendor'],
				  ],
				  columns: [
				    customerSearchColInternalId,
				    customerSearchColId,
				    customerSearchColName,
				  ],
				});
				var myPagedData = customerSearch.runPaged();
		        myPagedData.pageRanges.forEach(function(pageRange){
		            var myPage = myPagedData.fetch({index: pageRange.index});
	            	myPage.data.forEach(function(result){
	            		results.push({
							"value": result.id,
							"text": ''+result.getValue({name: 'entityid'})+' '+result.getValue({name: 'altname'})+'',
						})
	            	});
        		});
				return results;
			}catch(e){
				log.debug('Error',e)
			}
		}
		/**
		 * This function creates a formDefinition object which contains fields, sublist, buttons, etc. and will be used
		 * by formBuilder module to create the page.
		 */
		const createFormDefinitions = (defaults) => {
			let names = "HZPC Net Receivables/Payables";
			let SELECT_TX_TAB_ID = 'custpage_subtab';
			return {
				title: names,
				buttons: [{
					id: 'custpage_transactions',
					label: "Apply Filter",
					functionName: 'filtertransactions();'
				}],
				refreshbutton:[{
					id: 'custpage_pull_details',
					label: 'Refresh',
					functionName: 'refreshpage()'
				}],
				homebutton: [{
					id: 'custpage_goto_home',
					label: 'Home Page',
					functionName: 'gotohome('+scriptId+','+deploymentId+')'
				}],
				postfields: [{
					id: 'custpage_task_submit',
					type: serverWidget.FieldType.TEXT,
					label: 'Submit Task',
					displayType   : serverWidget.FieldDisplayType.HIDDEN,
				},
				{
					id: 'custpage_task_status',
					type: serverWidget.FieldType.TEXT,
					label: 'Task Status',
					displayType   : serverWidget.FieldDisplayType.HIDDEN,
				},
                             {
					id: 'custpage_net_journal',
					type: serverWidget.FieldType.TEXT,
					label: 'Net journal',
					displayType   : serverWidget.FieldDisplayType.HIDDEN,
				},
                             
                            ],
				fields: [{
					id: 'custpage_main_customer',
					type: serverWidget.FieldType.SELECT,
					label: "Grower",
					selectOptions : defaults.growers,
					defaultValue  : defaults.selectedcustomer,
					isMandatory   : true
				},
				{
					id: 'custpage_main_subsidiary',
					type: serverWidget.FieldType.SELECT,
					label: "Subsidiary",
					source:'subsidiary',
					defaultValue  : defaults.selectedsubsidiary

				},
				/*{
					id: 'custpage_period',
					type: serverWidget.FieldType.SELECT,
					label: "Posting period",
					source:'accountingperiod',
					defaultValue  : defaults.selectedperiod
				},*/
				{
					id: 'custpage_main_date',
					type: serverWidget.FieldType.DATE,
					label: "Transaction date",
					defaultValue  : defaults.selecteddate
				},
				{
					id: 'custpage_main_due_date',
					type: serverWidget.FieldType.DATE,
					label: "Due date",
					defaultValue  : defaults.selectedduedate
				},
				{
					id: 'custpage_main_account',
					type: serverWidget.FieldType.SELECT,
					label: "Account",
					source:'account',
					//selectOptions : defaults.accountoption,
					defaultValue  : defaults.selectedaccount
				},
				{
					id: 'custpage_main_ap_tratype',
					type: serverWidget.FieldType.MULTISELECT,
					label: "Payables Transaction Type",
					selectOptions : defaults.purachTrantype,//defaults.accountoption,
					defaultValue  : defaults.apselectTratype,
					breakType : serverWidget.FieldBreakType.STARTCOL
				},
				{
					id: 'custpage_main_ar_tratype',
					type: serverWidget.FieldType.MULTISELECT,
					label: "Receivables Transaction Type",
					selectOptions : defaults.salesTrantype,
					defaultValue  : defaults.arselectTratype,
				},],
				subtabs: [{
					id: SELECT_TX_TAB_ID,
					label: "Select Transactions"
				}],
				submitButton: {
					id: 'submit',
					label: "Submit"
				},
              postsublists: [{
					id: 'custpage_hzpc0041_post_sublist',
					label: 'Net Journal',
					type: serverWidget.SublistType.LIST,
					tab: SELECT_TX_TAB_ID,
					fields: [
						{
							id: 'custpage_je_id',
							type: serverWidget.FieldType.TEXT,
							label: ' Number',
							displayType   : serverWidget.FieldDisplayType.INLINE,
						},
						{
							id: 'custpage_je_date',
							type: serverWidget.FieldType.TEXT,
							label: "Date",
							displayType: serverWidget.FieldDisplayType.INLINE,
						},{
							id: 'custpage_je_subsidiry',
							type: serverWidget.FieldType.TEXT,
							label: "Subsidiary",
							displayType: serverWidget.FieldDisplayType.INLINE,
						}
                    ]
                      }],
				sublists: [{
					id: 'custpage_hzpc0041_sublist',
					label: 'Select Transactions',
					type: serverWidget.SublistType.LIST,
					tab: SELECT_TX_TAB_ID,
					fields: [{
						id: 'custpage_hzpc0041_select',
						type: serverWidget.FieldType.CHECKBOX,
						label: "Select"
					},
						{
							id: 'custpage_id',
							type: serverWidget.FieldType.TEXT,
							label: ' Number',
							displayType   : serverWidget.FieldDisplayType.HIDDEN,

						},
						{
							id: 'custpage_invoice_date',
							type: serverWidget.FieldType.TEXT,
							label: "Date",
							displayType: serverWidget.FieldDisplayType.INLINE,
						},
						{
							id: 'custpage_invoice_duedate',
							type: serverWidget.FieldType.TEXT,
							label: "Due Date",
							displayType: serverWidget.FieldDisplayType.INLINE,
						},
						{
							id: 'custpage_type',
							type: serverWidget.FieldType.TEXT,
							label: "Type",
							displayType: serverWidget.FieldDisplayType.INLINE,
						},
						{
							id: 'custpage_tranid',
							type: serverWidget.FieldType.TEXT,
							label: "Document Number",
							displayType: serverWidget.FieldDisplayType.INLINE
						},
						{
							id: 'custpage_entity',
							type: serverWidget.FieldType.TEXT,
							label: "Customer",
							displayType: serverWidget.FieldDisplayType.INLINE
						},

						{
							id: 'custpage_line_ar_amount',
							type: serverWidget.FieldType.CURRENCY,
							label: "Receivables Amount",
							displayType: serverWidget.FieldDisplayType.INLINE
						},
						{
							id: 'custpage_line_ap_amount',
							type: serverWidget.FieldType.CURRENCY,
							label: "Payables Amount",
							displayType: serverWidget.FieldDisplayType.INLINE
						},
					]
				}]
			};
		};
		/**
		 * Add Invoice and Cash sale column values to the sublist
		 * @param {array} addResults
		 * @param {object} customSublist
		 */
		const addColumnsToSublist = (addResults, customSublist) => {
			let j = 0;
			addResults.forEach(function (result) {
				if(result.invoiceDate)
					customSublist.setSublistValue({
						id: 'custpage_invoice_date',
						line: j,
						value: result.invoiceDate
					});
				if(result.invoiceDueDate)
					customSublist.setSublistValue({
						id: 'custpage_invoice_duedate',
						line: j,
						value: result.invoiceDueDate
					});
				if (result.id ){
                   var recordUrl = url.resolveRecord({recordType: recordType[result.type],recordId:result.id ,isEditMode: false});
			  let documentNumber =result.documentNumber||'VIEW';
					customSublist.setSublistValue({
						id: 'custpage_tranid',
						line: j,
						value: '<a href="'+recordUrl+'" target="_blank" style="color:blue;">'+documentNumber+'</a>'//result.documentNumber
					});
                }
				if (result.type)
					customSublist.setSublistValue({
						id: 'custpage_type',
						line: j,
						value: result.type
					});
				if(result.entity)
					customSublist.setSublistValue({
						id: 'custpage_entity',
						line: j,
						value: result.entity
					});
				customSublist.setSublistValue({
					id: 'custpage_id',
					line: j,
					value: result.id
				});
				let apamount=result.apamount
				let aramount=result.aramount
				log.audit('aramount',aramount)
				log.audit('apamount',apamount)
				if(apamount)
					customSublist.setSublistValue({
						id: 'custpage_line_ap_amount',
						line: j,
						value: apamount
					});
				if(aramount)
					customSublist.setSublistValue({
						id: 'custpage_line_ar_amount',
						line: j,
						value: aramount
					});
				j++
			});
		}
		/**
		 * Fetch the paginated transaction results
		 * @param {object} pagedData
		 * @param {number} pageIndex
		 * @returns {*[]}
		 */
		const fetchTransactionData = (pagedData, pageIndex) => {
			const functionName = "fetchTransactionData";
			var results = [];
			try {
				let searchPage = pagedData.fetch({
					index: pageIndex
				});
				let colObj=searchPage.pagedData.searchDefinition.columns;
				//log.debug('searchPage',colObj);

				searchPage.data.forEach(function (result) {
					results.push({
						"id": result.id,
						"invoiceDate": result.getValue({
							name: 'trandate'
						}),
						"invoiceDueDate": result.getValue({
							name: 'duedate'
						}),
						"documentNumber": result.getValue({
							name: 'tranid'
						}),
						"totalAmount": '',
						"entity": result.getText({
							name: 'entity'
						}),
						"type": result.getText({
							name: 'type'
						}),
						"apamount": result.getValue(colObj[5]),
						"aramount": result.getValue(colObj[4]),

					})
				});
				return results;
			} catch (ex) {
				let errorStr = (ex.name != null) ? ex.name + '</br>' + ex.message + '</br>' + ex.stack + '</br>' : ex.toString();
				log.error('Error',
					`A problem occured whilst : <br>${errorStr}<br>functionName>>>>${functionName}`);
			}
		}
		const getPageId = (pageId, pageCount) => {
			const functionName = "getPageId";
			let processStr = "";
			let self = this;
			let id = 0;
			try {
				// Set pageId to correct value if out of index
				if (!pageId || pageId == '' || pageId < 0)
					return id;
				else if (pageId >= pageCount)
					return (pageCount - 1);
				else if (pageId > 0)
					return pageId;
			} catch (ex) {
				let errorStr = (ex.name != null) ? ex.name + '</br>' + ex.message + '</br>' + ex.stack + '</br>' : ex.toString();
				log.error('Error',
					`A problem occured whilst ${processStr}: <br>${errorStr}<br>functionName>>>>${functionName}`);

			}

		}

		/**
		 * Fetch the paginated transaction results
		 * @param {object} paginateObject
		 * @returns {*[]}
		 */
		const addPaginationWidgets = ({
										  pageId,
										  pageCount,
										  pageSize,
										  scriptId,
										  deploymentId,
										  transactionForm
									  }) => {
			// Add drop-down and options to navigate to specific page
			let selectOptions = transactionForm.addField({
				id: 'custpage_pageid',
				label: 'Page Index',
				type: serverWidget.FieldType.SELECT,
				container: 'custpage_subtab'

			});

			for (let i = 0; i < pageCount; i++) {
				if (i == pageId) {
					selectOptions.addSelectOption({
						value: i,
						text: ((i * pageSize) + 1) + ' - ' + ((i + 1) * pageSize),
						isSelected: true
					});
				} else {
					selectOptions.addSelectOption({
						value: i,
						text: ((i * pageSize) + 1) + ' - ' + ((i + 1) * pageSize)
					});
				}
			}
		}

		/**
		 * Adds default values to the form
		 * @param {object} transactionForm
		 * @param {object} params
		 */
		const addDefaultValues = (transactionForm, subsidiary) => {
			const functionName = "addDefaultValues";
			let self = this;
			try {
				transactionForm.updateDefaultValues({
					custpage_subsidiary: subsidiary
				});
			} catch (ex) {
				let errorStr = (ex.name != null) ? ex.name + '</br>' + ex.message + '</br>' + ex.stack + '</br>' : ex.toString();
				log.error('Error',
					`A problem occured whilst ${processStr}: <br>${errorStr}<br>functionName>>>>${functionName}`);
			}
		}


		const runSearch = () => {
			var filter = [];
			filter.push(search.createFilter({name: "amountremainingisabovezero", operator: search.Operator.IS,values:'T'}));
			filter.push(search.createFilter({name: "otherrelationships",join:'customermain', operator: search.Operator.ANYOF,values: "Vendor"}));
			filter.push(search.createFilter({name: "accounttype", operator: search.Operator.ANYOF,values:[ "AcctRec","AcctPay"]}));
			filter.push(search.createFilter({name: "posting", operator: search.Operator.IS,values: "T"}));
			filter.push(search.createFilter({name: "custcol_hzpc008_customer", operator: search.Operator.ANYOF,values: "@ALL@"}));
			filter.push(search.createFilter({name: "status", operator:  "noneof",values: ["CustInvc:B", "VendBill:B"]}));
			if(defaults.selectedsubsidiary)
				filter.push(search.createFilter({name: "subsidiary", operator: search.Operator.ANYOF,values:defaults.selectedsubsidiary}));
			if(defaults.account)
				filter.push(search.createFilter({name: "account", operator: search.Operator.ANYOF,values:defaults.account}));
			if(defaults.selectedperiod)
				filter.push(search.createFilter({name: "internalid",join:'accountingperiod',operator: search.Operator.ANYOF,values:defaults.selectedperiod}));
			if(defaults.selecteddate)
				filter.push(search.createFilter({name: "trandate", operator: search.Operator.ON,values:defaults.selecteddate}));
			if(defaults.selectedcustomer)
				filter.push(search.createFilter({name: "name", operator: search.Operator.IS,values:defaults.selectedcustomer}));
			if(defaults.selectedduedate)
				filter.push(search.createFilter({name: "duedate", operator: search.Operator.ON,values:defaults.selectedduedate}));

			if(defaults.arselectTratype.length>0&&defaults.apselectTratype.length>0){
				let trntype=[];
				for(let ar =0;ar<defaults.arselectTratype.length;ar++){
					trntype.push(defaults.arselectTratype[ar])
				}
				for(let ap =0;ap<  defaults.apselectTratype.length;ap++){
					trntype.push(defaults.apselectTratype[ap])
				}
				filter.push(search.createFilter({name: "type", operator: search.Operator.ANYOF,values:trntype}));
			}else if (defaults.arselectTratype.length>0){
				filter.push(search.createFilter({name: "type", operator: search.Operator.ANYOF,values:defaults.arselectTratype}));
			}else if(defaults.apselectTratype.length>0){
				filter.push(search.createFilter({name: "type", operator: search.Operator.ANYOF,values:defaults.apselectTratype}));
			}else{
				filter.push(search.createFilter({name: "type", operator: search.Operator.ANYOF,values:["VendBill","VendCred","VendPymt","CustInvc","CustCred","CustPymt"]}));
			}

			var searchObj = search.create({
				type: "transaction",
				filters:filter ,
				columns: [
					search.createColumn({
						name: "trandate",
						label: "Date"
					}),
					search.createColumn({
						name: "type",
						label: "Type"
					}),
					search.createColumn({
						name: "entity",
						sort: search.Sort.ASC,
						label: "Name"
					}),
					search.createColumn({
						name: "tranid",
						label: "Document Number"
					}),
					search.createColumn({
						name: "formulacurrency",
						formula: "case when {accounttype} = 'Accounts Receivable' and {creditfxamount} is null then {fxamountremaining} when {accounttype} = 'Accounts Receivable' and {debitfxamount} is null then -{fxamountremaining} else 0 end",
						label: "Accounts Receivable"
					}),
					search.createColumn({
						name: "formulacurrency",
						formula: "case when {accounttype} = 'Accounts Payable' and {creditfxamount} is null then -{fxamountremaining} when {accounttype} = 'Accounts Payable' and {debitfxamount} is null then {fxamountremaining} else 0 end",
						label: "Accounts Payable"
					}),
                  
					search.createColumn({
						name: "duedate",
						label: "Due Date"
					})
				]
			});
			return searchObj;
		}

		/**
		 * Listen to the form submit event and tracks the URL params
		 * @param {object} paramsObj
		 */
		const formSubmitListener = (paramsObj) => {
			const functionName = "formSubmitListener";
			let self = this;
			let hasUrlParam = false;
			const validationParams = ['subsidiary'];
			try {
				for (const property in paramsObj) {
					let hasParam = validationParams.includes(property);
					if (hasParam) {
						hasUrlParam = true;
						break;
					}
				}
			} catch (ex) {
				let errorStr = (ex.name != null) ? ex.name + '</br>' + ex.message + '</br>' + ex.stack + '</br>' : ex.toString();
				log.error('Error',
					`A problem occured whilst  <br>${errorStr}<br>functionName>>>>${functionName}`);

			}
		}
        const addPostsublist =(addResults, customSublist) => {
			let k = 0;
			addResults.run().each(function (result) {
               let internalId= result.getValue(result.columns[3]);
              let jeUrl = url.resolveRecord({recordType: 'journalentry',recordId:internalId,isEditMode: false});
			  let documentNumber = result.getValue(result.columns[0]);
              log.debug('jeUrl'+internalId,jeUrl);
              	customSublist.setSublistValue({
						id: 'custpage_je_id',
						line: k,
						value:'<a href="'+jeUrl+'" target="_blank" style="color:blue;">'+documentNumber+'</a>'
					});
              	customSublist.setSublistValue({
						id: 'custpage_je_date',
						line: k,
						value: result.getValue(result.columns[1])
					});
              	customSublist.setSublistValue({
						id: 'custpage_je_subsidiry',
						line: k,
						value: result.getValue(result.columns[2])
					});
              k++;
            });
        }
        const netJournal=(jenum)=>{
          let journalentrySearchObj ='';
          if(jenum){
         journalentrySearchObj = search.create({
   type: "journalentry",
   filters:
   [
      ["type","anyof","Journal"], 
      "AND", 
      ["custbody_hzpc0041_mr_net_journal","contains",jenum]
   ],
   columns:
   [
      search.createColumn({
         name: "tranid",
         summary: "GROUP",
         label: "Document Number"
      }),
     
      search.createColumn({
         name: "trandate",
         summary: "GROUP",
         label: "Date"
      }),
      search.createColumn({
         name: "subsidiarynohierarchy",
         summary: "GROUP",
         label: "Subsidiary (no hierarchy)"
      }),
      search.createColumn({
         name: "internalid",
         summary: "GROUP",
         label: "internalid Number"
      }),
     
   ]
});
          }
          return journalentrySearchObj;
        }
		return {
			handleGetOperation: handleGetOperation,
			handlePostOperation: handlePostOperation,
			buildNettingForm: buildNettingForm,
			fetchTransactionData: fetchTransactionData
		}
	});