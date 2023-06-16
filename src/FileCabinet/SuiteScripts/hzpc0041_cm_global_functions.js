/**
 * @NApiVersion 2.1
 **/
define(['N/query','N/util','N/record','N/search','N/ui/serverWidget','N/task'],
		(query, util,record,search,serverWidget,task) => {
			const globalFun = {};
			globalFun.runQuery = ({ sql, limit, pageSize,queryName }) => {
				const functionName = "runQuery";
				let processStr = "";
				let self = this;
				let records = [];
				try {
					if (!sql) return [];

					const sqlPageSize = pageSize || 5000;
					let paginatedRowBegin = 1;
					const paginatedRowEnd = limit || 9999999999;
					let isMoreRecords = true;
					const startTime = new Date().getTime();
					do {
						const paginatedSQL = `SELECT * FROM (SELECT ROWNUM AS ROWNUMBER, * FROM (  ${sql} ) )  WHERE ( ROWNUMBER BETWEEN ${paginatedRowBegin} AND ${paginatedRowEnd} )`;
						const queryResults = query.runSuiteQL({query: paginatedSQL, params: []}).asMappedResults();
						records.push(...queryResults);
						if (queryResults.length < sqlPageSize) {
							isMoreRecords = false;
						}
						paginatedRowBegin += sqlPageSize;
					} while (isMoreRecords);

					log.debug(`queryFetch (${queryName}) total time>>>>>>>>`,
							(new Date().getTime() - startTime) / 1000);

				}
				catch (ex) {
					let errorStr = (ex.name != null) ? ex.name + '</br>' + ex.message + '</br>' + ex.stack + '</br>' : ex.toString();
					log.error('Error',
							`A problem occured whilst ${processStr}: <br>${errorStr}<br>functionName>>>>${functionName}`);

				}

				return records;
			};
			globalFun.jsoData = (param) => {
				let recObj=[];
				recObj['subsidiary'] = param.subsidiary;
				recObj['entityid'] = param.entityid;
				recObj['currency'] = param.currency;
				recObj['netje'] = param.netje;
				return recObj;
			}
			//Group by the entity
			globalFun.groupBy = (objectArray, property) => {
				return objectArray.reduce(function (acc, obj) {
					var key = obj[property];
					if (!acc[key]) {
						acc[key] = [];
					}
					acc[key].push(obj);
					return acc;
				}, {});
			}
			globalFun.runSearch = () => {
				var searchObj = search.create({
					type: "transaction",
					filters: [

					          ["customermain.otherrelationships", "anyof", "Vendor"],
					          "AND",
					          ["accounttype", "anyof", "AcctRec", "AcctPay"],
					          "AND",
					          ["posting", "is", "T"],
					          "AND",
					          ["custcol_hzpc008_customer", "anyof", "@ALL@"],
					          "AND",
					          ["status", "noneof", "CustInvc:B", "VendBill:B"],
					          "AND",
					          ["type", "anyof", ["VendBill", "VendCred", "VendPymt", "CustInvc", "CustCred", "CustPymt"]]

					          ],
					          columns: [
					                    search.createColumn({
					                    	name: "internalid",
					                    	label: "internalid"
					                    }),
					                    search.createColumn({
					                    	name: "entity",
					                    	sort: search.Sort.ASC,
					                    	label: "Name"
					                    }),
					                    search.createColumn({
					                    	name: "amount",
					                    	label: "amount"
					                    }),
					                    search.createColumn({
					                    	name: "type",
					                    	label: "type"
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
					                    	name: "subsidiary",
					                    	label: "subsidiary"
					                    }),
					                    search.createColumn({
					                    	name: "currency",
					                    	label: "currency"
					                    }),
					                    search.createColumn({
					                    	name: "tranid",
					                    	label: "Document Number"
					                    })

					                    ]
				});
				return searchObj;
			}
			/**
			 * Native Pagination
			 * @param {string} sql
			 * @returns {*[]}
			 */
			globalFun.queryFetch = ({ sql }) => {

				const functionName = "queryFetch";
				let processStr = "";
				let results = [];

				try {
					const queryResult = query.runSuiteQLPaged({
						query: sql,
						pageSize: 1000,
					});

					queryResult.pageRanges.forEach((page, index) => {
						queryResult.fetch({index}).data.results.forEach((rowObj) => {
							results.push(rowObj.asMap());
						});
					});
				}

				catch (ex) {
					let errorStr = (ex.name != null) ? ex.name + '</br>' + ex.message + '</br>' + ex.stack + '</br>' : ex.toString();
					log.error('Error',
							`A problem occured whilst ${processStr}: <br>${errorStr}<br>functionName>>>>${functionName}`);

				}

				return results;
			};


			/*Pagination for search results
			 * @param {string} sql
			 * @returns {*[]}
			 */
			globalFun.runPagedQuery = (sql,pageSize) => {
				return query.runSuiteQLPaged({
					query: sql,
					pageSize: pageSize,
				});
			};

			/************** Custom Form Utilities **************/

			/**
			 * addSubtabs - Add subtab to the form
			 *
			 * @param  {Form} form    description
			 * @param  {Array} subtabs Array of subtabs containing id, label, tab(if applicable)
			 */
			globalFun.addSubTabs = (form, subtabs) => {
				if(subtabs) {
					for(let i = 0; i < subtabs.length; i++){
						form.addSubtab(subtabs[i]);
					}
				}
			}
			/**
			 * addButtons - Adds button to the form
			 *
			 * @param  {Form}  form    form object
			 * @param  {Array} buttons Array of button containing id, label, and functionName
			 */
			globalFun.addButtons = (form, buttons) => {
				if(buttons) {
					for(let i = 0; i < buttons.length; i++){
						form.addButton(buttons[i]);
					}
				}
			}


			/**
			 * addFields - Adds fields to the form
			 *
			 * @param  {Form}  form    form object
			 * @param  {Array} fields Array of fields containing id, label, source and type
			 */
			globalFun.addFields = (form, fields) => {

				if(fields) {
					for (let i = 0; i < fields.length ; i++){
						let field= form.addField(fields[i]);
						globalFun.setFieldProperties(field, fields[i]);
					}
				}
			}
			/**
			 * addSublists - Adds sublist to the form
			 *
			 * @param  {Form}  form    form object.
			 * @param  {Array} sublists Array of fields containing id, label, source and type.
			 */
			globalFun.addSublists = (form, sublists) => {

				if(sublists){
					for (let i = 0; i < sublists.length ; i++){
						var customSublist = form.addSublist(sublists[i]);
						//  log.debug('sublists[i]',sublists[i]);
						if(sublists[i].id=='custpage_hzpc0041_sublist')
							customSublist.addMarkAllButtons();

						let sublistFields = sublists[i].fields;
						for(let j = 0; j < sublistFields.length ; j++){
							let sublistColumnField = customSublist.addField(sublistFields[j]);
							globalFun.setFieldProperties(sublistColumnField, sublistFields[j]);
						}

					}

				}

				return customSublist;
			}


			/**
			 * globalFun.setFieldProperties - Sets properties to the field object
			 * This function is also used when setting properties of sublist fields
			 *

			 */
			globalFun.setFieldProperties = (field, obj) => {
				if (obj.help) {
					field.setHelpText(obj.help);
				}

				if (obj.defaultValue) {
					field.defaultValue = obj.defaultValue;
				}

				if (obj.linkText) {
					field.linkText = obj.linkText;
				}

				if (obj.breakType) {
					field.updateBreakType({"breakType": obj.breakType});
				}

				if (obj.layoutType) {
					field.updateLayoutType({"layoutType": obj.layoutType});
				}

				if (obj.isMandatory) {
					field.isMandatory = obj.isMandatory;
				}

				if (obj.maxLength) {
					field.maxLength = obj.maxLength;
				}

				if (obj.displayType) {
					field.updateDisplayType({"displayType": obj.displayType});
				}

				if (obj.displaySize) {
					field.updateDisplaySize(obj.displaySize);
				}

				if (obj.selectOptions) {
					globalFun.addSelectOptions(field, obj.selectOptions);
				}
			}


			/**
			 * @param {string} checkVar
			 * @return {boolean}
			 */
			globalFun.isEmpty = (checkVar) => {
				return checkVar == null || false || checkVar === '' ||
				checkVar === 'null';
			}

			globalFun.isNullOrEmptyObject = (obj) =>
			{
				let hasOwnProperty = Object.prototype.hasOwnProperty;

				if (obj.length && obj.length > 0) { return false; }
				for (let key in obj) { if (hasOwnProperty.call(obj, key)) return false; }
				return true;
			}
			/**
			 * Get the search result
			 */
			globalFun.getSearchResult = (pagedDataObj) => {
				var pagedData = pagedDataObj.runPaged({
					pageSize: 1000
				});
				var resultDetails = new Array();
				pagedData.pageRanges.forEach(function (pageRange) {
					var myPage = pagedData.fetch({
						index: pageRange.index
					});
					myPage.data.forEach(function (result) {
						resultDetails.push(result);
					});
				});
				return resultDetails;
			};

			globalFun.getStatus=(scriptId)=> {
				var taskSearch = search.create({
					type: search.Type.SCHEDULED_SCRIPT_INSTANCE,
					filters: [{
						join: "script",
						name: "scriptid",
						operator: search.Operator.IS,
						values: [scriptId]
					}],
					columns: ["taskid", {
						name: "datecreated",
						sort: search.Sort.DESC
					}]
				});
				var taskRecord = taskSearch.run().getRange({
					start: 0,
					end: 1
				});
				if (taskRecord.length === 0) {
					return null;
				}
				return task.checkStatus({
					taskId: taskRecord[0].getValue({
						name: "taskid"
					})
				});
			}

			globalFun.applycreditmemo = (creditpayObj) => {
				try {
					log.debug('recTran', creditpayObj);
					var Objapply = record.create({
						type: creditpayObj.type,
						isDynamic: true
					});
					Objapply.setValue({
						fieldId: 'entity',
						value: creditpayObj.entityid
					});
					let listOftrn = creditpayObj.tran;
					log.debug('listOftrn', listOftrn);
					var lineCount = Objapply.getLineCount({
						sublistId: 'apply'
					});
					for (var i = 0; i < lineCount; i++) {
						var applyID = Objapply.getSublistValue({
							sublistId: 'apply',
							fieldId: 'internalid',
							line: i
						});
						if (listOftrn.indexOf(applyID) != -1) {
							log.debug('applyID' + applyID, 'advInterJEId' + advInterJEId);
							//if (applyID == advInterJEId) {
							//log.debug('Found applyID', applyID);
							Objapply.selectLine({
								sublistId: 'apply',
								line: lineNumber
							});
							Objapply.setCurrentSublistValue({
								sublistId: 'apply',
								fieldId: 'apply',
								value: true
							});

							Objapply.commitLine({
								sublistId: 'apply'
							});

						}
					}
					var appliyrecord = Objapply.save({
						enableSourcing: true,
						ignoreMandatoryFields: true
					});
				} catch (e) {
					log.error('Crrdit', e)
				}
			}
			// create Jounal 
			globalFun.createJournals = (jeObj) => {
				try {
					//log.debug('jeObj', jeObj);
					let journalRecordCreate = record.create({
						type: 'journalentry',
						isDynamic: true
					});
					let jrnalMemo = 'Netting journal ' + new Date() + '';
					let net_journal=jeObj.netje;
					journalRecordCreate.setValue({
						fieldId: 'trandate',
						value: new Date()
					});
					journalRecordCreate.setValue({
						fieldId: 'memo',
						value: jrnalMemo
					});
					log.debug('net_journal',net_journal);
					if(net_journal){
						journalRecordCreate.setValue({
							fieldId: 'custbody_hzpc0041_mr_net_journal',
							value: net_journal
						});}

					journalRecordCreate.setValue({
						fieldId: 'approved',
						value: true
					});
                  journalRecordCreate.setValue({
						fieldId: 'approvalstatus',
						value: 2
					});
					journalRecordCreate.setValue({
						fieldId: 'subsidiary',
						value: jeObj.subsidiary
					});
					journalRecordCreate.setValue({
						fieldId: 'currency',
						value: jeObj.currency
					});
					let linecount = jeObj.line;
					for (let i = 0; i < linecount.length; i++) {
						log.debug('linecount[i].amount' + linecount[i].type, linecount[i].amount + '/////' + linecount[i].linememo);
						if (linecount[i].type == 'credit') {
							journalRecordCreate.selectNewLine({
								sublistId: 'line',
							});
							journalRecordCreate.setCurrentSublistValue({
								sublistId: 'line',
								fieldId: 'account',
								value: linecount[i].account,
								ignoreFieldChange: true
							});
							journalRecordCreate.setCurrentSublistValue({
								sublistId: 'line',
								fieldId: 'credit',
								value: linecount[i].amount,
								ignoreFieldChange: true
							});
							log.debug('credit', journalRecordCreate.getCurrentSublistValue({
								sublistId: 'line',
								fieldId: 'credit',
							}))
							journalRecordCreate.setCurrentSublistValue({
								sublistId: 'line',
								fieldId: 'entity',
								value: jeObj.entityid,
								ignoreFieldChange: true
							});
							if (linecount[i].linememo != undefined)
								journalRecordCreate.setCurrentSublistValue({
									sublistId: 'line',
									fieldId: 'memo',
									value: linecount[i].linememo,
									ignoreFieldChange: true
								});

							journalRecordCreate.commitLine({
								sublistId: 'line'
							});
						} else if (linecount[i].type == 'debit') {

							journalRecordCreate.selectNewLine({
								sublistId: 'line',
							});
							journalRecordCreate.setCurrentSublistValue({
								sublistId: 'line',
								fieldId: 'account',
								value: linecount[i].account
							});
							journalRecordCreate.setCurrentSublistValue({
								sublistId: 'line',
								fieldId: 'debit',
								value: linecount[i].amount,
								ignoreFieldChange: true
							});

							journalRecordCreate.setCurrentSublistValue({
								sublistId: 'line',
								fieldId: 'entity',
								value: jeObj.entityid,
								ignoreFieldChange: true
							});
							if (linecount[i].linememo != undefined)
								journalRecordCreate.setCurrentSublistValue({
									sublistId: 'line',
									fieldId: 'memo',
									value: linecount[i].linememo,
									ignoreFieldChange: true
								});
							journalRecordCreate.commitLine({
								sublistId: 'line'
							});

						}
					}

					let journalRecordId = journalRecordCreate.save({
						enableSourcing: true,
						ignoreMandatoryFields: true
					});
					log.debug('journalRecordId',journalRecordId);

					return journalRecordId.toString();

				} catch (e) {
					log.error('Error createJournals', e);
				}
			}
			//create the payment
			globalFun.createPayment = (payObj) => {
				try {
					let trnlist = payObj.tran;
					let paymentList=payObj.payment;
					let journalID = payObj.journal;
					let entity = payObj.entity;
					let amount=payObj.amount;
					let jeamount=payObj.jeamount;
					log.debug('trnlist', trnlist);
					log.debug('payObj', payObj);
					let paymentCount=paymentList.length>0?paymentList.length:1;
					log.debug('paymentCount',paymentCount);
					for(let p=0;p<paymentCount;p++){
						var paymentRec ;
						if(paymentList.length==0){
							paymentRec= record.create({
								type: payObj.type,
								isDynamic: true
							});
						}
						if(paymentList.length>0)
						{
							log.debug('paymentList[p]',paymentList[p]);
							paymentRec = record.load({
								type: payObj.type,
								id:paymentList[p],
								isDynamic: true
							});              
						}
						//log.debug('paymentRec', paymentRec);
						//Applying the journal entry to the Invoice.
						if (payObj.type == 'customerpayment') {
							paymentRec.setValue({
								fieldId: 'customer',
								value: entity
							});

						} else if (payObj.type == 'vendorpayment') {
							paymentRec.setValue({
								fieldId: 'entity',
								value: entity
							});
							paymentRec.setValue({
								fieldId: 'isintransitpayment',
								value: false
							});
						}
						let date = new Date();
						if (date != null && date != '') {
							paymentRec.setValue({
								fieldId: 'trandate',
								value: date
							});
						}
						//for (var t = 0; t < trnlist.length; t++) {

						var lineCount = paymentRec.getLineCount({
							sublistId: 'apply'
						});
						log.debug('lineCount'+ lineCount,paymentList);
						let total_amount=0;
						for (var count = 0; count < lineCount; count++) {
							var applyID = paymentRec.getSublistValue({
								sublistId: 'apply',
								fieldId: 'internalid',
								line: count
							});
							if(paymentList.length>0){
								if (trnlist.indexOf(applyID)!=-1) {
									log.debug('applyID', applyID);

									paymentRec.selectLine({
										sublistId: 'apply',
										line: count
									});
									paymentRec.setCurrentSublistValue({
										sublistId: 'apply',
										fieldId: 'apply',
										value: true
									});
									paymentRec.commitLine({
										sublistId: 'apply'
									});
								}
							}else{
								/*if (trnlist.indexOf(applyID)!=-1) {
										log.debug('applyID', applyID);
								 */
								/*	if(applyID==journalID){
											paymentRec.selectLine({
												sublistId: 'apply',
												line: count
											});
											paymentRec.setCurrentSublistValue({
												sublistId: 'apply',
												fieldId: 'apply',
												value: true
											});
											paymentRec.commitLine({
												sublistId: 'apply'
											});
										}*/
								if (trnlist.indexOf(applyID)!=-1) {

									if(applyID==journalID){
										log.debug('641 applyID match JE'+journalID, applyID);
										paymentRec.selectLine({
											sublistId: 'apply',
											line: count
										});
										paymentRec.setCurrentSublistValue({
											sublistId: 'apply',
											fieldId: 'apply',
											value: true
										});
										paymentRec.commitLine({
											sublistId: 'apply'
										});
									}else{
										paymentRec.selectLine({
											sublistId: 'apply',
											line: count
										});
										log.debug('count', count);
										let total=paymentRec.getCurrentSublistValue({
											sublistId: 'apply',
											fieldId: 'due',
										});
										total_amount=Number(total_amount)+Number(total);
										let remaining_amount=Number(jeamount)-Number(total_amount);
										log.debug('619 remaining_amount',remaining_amount);
										if(remaining_amount>=0){
											log.debug('total',total);
											paymentRec.setCurrentSublistValue({
												sublistId: 'apply',
												fieldId: 'apply',
												value: true
											});
											paymentRec.setCurrentSublistValue({
												sublistId: 'apply',
												fieldId: 'amount',
												value: total
											});
											paymentRec.commitLine({
												sublistId: 'apply'
											});
										}else {
											let remainingamount=Number(total)+Number(remaining_amount);
											if(remainingamount>0){
												log.debug('636 remainingamount',remainingamount);
												paymentRec.setCurrentSublistValue({
													sublistId: 'apply',
													fieldId: 'apply',
													value: true
												});
												paymentRec.setCurrentSublistValue({
													sublistId: 'apply',
													fieldId: 'amount',
													value: remainingamount
												});
												paymentRec.commitLine({
													sublistId: 'apply'
												});
											}
										}
									}
								}
								//}
							}
						}
						log.debug('end', 'loop');
						var creditlinecount = paymentRec.getLineCount({
							sublistId: 'credit'
						});
						log.debug('creditlinecount', creditlinecount);
						//Applying the credits to the Invoice.........
						if (creditlinecount != null && creditlinecount != 0) {
							for (var counter = 0; counter < creditlinecount; counter++) {
								var creditdoc = paymentRec.getSublistValue({
									sublistId: 'credit',
									fieldId: 'doc',
									line: counter
								});
								if (creditdoc != null && creditdoc != 0) {
									if (trnlist.indexOf(creditdoc)!=-1) {
										log.debug('creditdoc' + creditdoc, 'JournalId' + journalID);
										paymentRec.selectLine({
											sublistId: 'credit',
											line: counter
										});
										paymentRec.setCurrentSublistValue({
											sublistId: 'credit',
											fieldId: 'apply',
											value: true
										});
										paymentRec.commitLine({
											sublistId: 'credit'
										});
									}
								}
							}
						}
						// }
						//Submitting the payment record.....................
						var paymentRecId = paymentRec.save({
							enableSourcing: true,
							ignoreMandatoryFields: true
						});
						log.debug(';paymentRecId', paymentRecId);
					}
				} catch (e) {
					log.error('ERROR in Create Payment', e)
				}

			}
			globalFun.isTaskInProgress=(taskToCheck)=> {
				return taskToCheck.status !== task.TaskStatus.COMPLETE && taskToCheck.status !== task.TaskStatus.FAILED;
			}
			globalFun.addSelectOptions=(field, options)=>{
				for (var i = 0; i < options.length ; i++){
					field.addSelectOption(options[i]);
				}

			}
			//apply credit to bill and invoice
			globalFun.applyCrdit =(creditObj) => {
				let credits=creditObj.credit;
				let applycredits=creditObj.applycredit;
				let type=creditObj.type;
              log.debug('credits'+type,credits);
               log.debug('applycredits',applycredits);
				credits.map((id) => {
                  
					let creditRec = record.load({
						type: type,
						id:id,
						isDynamic: true
					}); 
					var lineCount = creditRec.getLineCount({
						sublistId: 'apply'
					});
					log.debug('lineCount'+ lineCount,applycredits);
					for (var count = 0; count < lineCount; count++) {
						var applyID = creditRec.getSublistValue({
							sublistId: 'apply',
							fieldId: 'internalid',
							line: count
						});
						if(applycredits.indexOf(applyID)!=-1){
							creditRec.selectLine({
								sublistId: 'apply',
								line: count
							});
							creditRec.setCurrentSublistValue({
								sublistId: 'apply',
								fieldId: 'apply',
								value: true
							});
							creditRec.commitLine({
								sublistId: 'apply'
							});
						}
					}
					//Submitting the Credit record.....................
					var creditRecId = creditRec.save({
						enableSourcing: true,
						ignoreMandatoryFields: true
					});
					log.debug('creditRecId', creditRecId);
				
				  });
				
			}
			globalFun.getminAmount = (internalid) => {
				var transactionSearchObj = search.create({
					type: "transaction",
					filters: [
					          ["customermain.otherrelationships", "anyof", "Vendor"],
					          "AND",
					          ["accounttype", "anyof", "AcctRec", "AcctPay"],
					          "AND",
					          ["posting", "is", "T"],
					          "AND",
					          ["custcol_hzpc008_customer", "anyof", "@ALL@"],
					          "AND",
					          ["status", "noneof", "CustInvc:B", "VendBill:B"],
					          "AND",
					          ["internalid", "anyof", internalid],

					          ],
					          columns: [
					                    search.createColumn({
					                    	name: "type",
					                    	summary: "GROUP",
					                    	label: "Type"
					                    }),
					                    search.createColumn({
					                    	name: "formulacurrency",
					                    	summary: "MIN",
					                    	formula: "case when {accounttype} = 'Accounts Receivable' and {creditfxamount} is null then {fxamountremaining} when {accounttype} = 'Accounts Receivable' and {debitfxamount} is null then -{fxamountremaining} else 0 end",
					                    	label: "Formula (Currency)"
					                    }),
					                    search.createColumn({
					                    	name: "formulacurrency",
					                    	summary: "MIN",
					                    	formula: "case when {accounttype} = 'Accounts Payable' and {creditfxamount} is null then -{fxamountremaining} when {accounttype} = 'Accounts Payable' and {debitfxamount} is null then {fxamountremaining} else 0 end",
					                    	label: "Formula (Currency)"
					                    })
					                    ]
				});

				return transactionSearchObj;

			}
			/************** Custom Form Utilities **************/
			//return {groupBy,runSearch,runQuery, addSubTabs,addButtons,runPagedQuery,addFields,addSublists,isEmpty,isNullOrEmptyObject,getSearchResult,getStatus,calculateTaskProgress,isTaskInProgress,addSelectOptions}
			return globalFun;
		});
