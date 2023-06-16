/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
let apAccount = '111';
let arAccount = '119';
let recType = {
		"Bill Credit": 'vendorcredit',
		"Credit Memo": 'creditmemo'
}
define(['N/record', 'N/search', 'N/runtime', '../library/hzpc0041_cm_global_functions.js'],
		(record, search, runtime, global) => {
			let getInputData = () => {
				try {
					log.debug('@@@@@@@@@@-START-@@@@@@@@@@')
					var currScript = runtime.getCurrentScript();
					let mySearch;
					let internalIds;
					let internalJson = currScript.getParameter('custscript_hzpc_script_parameter');
					let jeInternal = currScript.getParameter('custscript_hzpc_script_je');
					if (internalJson != '' && internalJson != null) {
						let objJson = JSON.parse(internalJson);
						internalIds = objJson['ids'];
					}

					mySearch = global.runSearch(); 
					if (internalIds)
						mySearch.filters.push(search.createFilter({
							name: 'internalid',
							operator: search.Operator.ANYOF,
							values: internalIds
						}));
					let searchResults = global.getSearchResult(mySearch);

					let customerJson = [];
					searchResults.forEach(function (result) {
						customerJson.push({
							"customer": result.getValue(result.columns[1]),
							"amount": Number(result.getValue(result.columns[2])),
							"id": result.getValue(result.columns[0]),
							"type": result.getText(result.columns[3]),
							"entityid": result.getValue(result.columns[1]),
							"subsidiary": result.getValue(result.columns[6]),
							"currency": result.getValue(result.columns[7]),
							"tranid": result.getValue(result.columns[8]),
							"aramount": Number(result.getValue(result.columns[4])),
							"apamount": Number(result.getValue(result.columns[5])),
							"netje":jeInternal
						})
					})

					log.debug('customerJson',customerJson);
					const res = global.groupBy(customerJson, "customer");

					return res;
				} catch (ex) {
					log.error('getInputData error: ', ex.message);
				}
			}
			let map = (context) => {
				try {
					var lineData = JSON.parse(context.value);
					let invObj = {};
					let billObj = {};
					let creditObj = {};
					let paymentObj = {};
					let billpaymentObj = {};
					let billcreditObj = {};
					let invoiceTotal = 0;
					let billTotal = 0;
					let invoiceList = [];
					let billList = [];
					let billamount = [];
					let invAmount = [];
					let min_inv_bill = [];
					let min_credit = [];
					let vendor_credit_List = [];
					let customer_credit_List = [];
					let customerPayment=[];
					let vendorPayment=[];
					let apmemo=[];
					let armemo=[];
					let billcreditTotal=0;
					let creditTotal=0;

					log.debug('lineData',lineData);
					for (let i in lineData) {
						let obj = lineData[i];
						if (obj.type == 'Invoice') {
							invObj = global.jsoData(obj);
							invoiceList.push(obj.id);
							invAmount.push(obj.aramount);
							min_inv_bill.push(obj.aramount);
							armemo.push(obj.tranid);
							invoiceTotal=Number(invoiceTotal)+Number(obj.aramount);
						} else if (obj.type == 'Credit Memo') {
							creditObj = global.jsoData(obj);
							min_credit.push(obj.aramount);
							customer_credit_List.push(obj.id);
							creditTotal=Number(creditTotal)+Number(obj.aramount);
						} else if (obj.type == 'Payment') {
							customerPayment.push(obj.id);
						} else if (obj.type == 'Bill') {
							billObj = global.jsoData(obj);
							apmemo.push(obj.tranid);
							billamount.push(obj.apamount);
							billList.push(obj.id);
							min_inv_bill.push(obj.apamount);
							billTotal=Number(billTotal)+Number(obj.apamount);
						} else if (obj.type == 'Bill Credit') {
							billcreditObj = global.jsoData(obj);
							min_credit.push(obj.apamount);
							billcreditTotal=Number(billcreditTotal)+Number(obj.apamount);
							vendor_credit_List.push(obj.id)
						} else if (obj.type == 'Bill Payment') {
							vendorPayment.push(obj.id);
						}
					}

					let min_val=[];
					min_val.push(invoiceTotal);
					min_val.push(billTotal);
					log.debug('min_val',min_val);
					let min_amt = Math.min(...min_val);
					log.debug('min_amt', min_amt);
					invObj['line'] = [{
						'amount': min_amt,
						'account': apAccount,
						'type': 'debit',
						"linememo": apmemo.toString()
					}, {
						'amount': min_amt,
						'account': arAccount,
						'type': 'credit',
						"linememo":  armemo.toString()
					}]
					let min_credit_amt = Math.min(...min_credit);
					if (min_credit_amt < 0) {
						min_credit_amt * -1
					}
					log.debug('invoiceList', invoiceList);
					if(vendorPayment.length>0||customerPayment.length>0){
						if(customerPayment.length>0){
							let custpaymentObj = {
									'journal': '',
									'entity': invObj.entityid,
									'type': 'customerpayment',
									'tran': invoiceList ,
									'payment':customerPayment,
									'amount':invAmount,
									'jeamount':''
							};
							global.createPayment(custpaymentObj);
						}
						if(vendorPayment.length>0){
							let venpaymentObj = {
									'journal': '',
									'entity': billObj.entityid,
									'type': 'vendorpayment',
									'tran': billList,
									'payment':vendorPayment ,
									'amount':billamount,
									'jeamount':''
							};
							global.createPayment(venpaymentObj);
						}
					}else if(vendor_credit_List.length>0||customer_credit_List.length>0){
                      log.debug('Enter ',vendor_credit_List)
						if(vendor_credit_List.length>0){
							let creditObj={
									'credit':vendor_credit_List,
									'applycredit':billList,
									'type':'vendorcredit'	
							}
							global.applyCrdit(creditObj);
						}
						if(customer_credit_List.length>0){
							let creditObj={
									'credit':customer_credit_List,
									'applycredit':invoiceList,
									'type':'creditmemo'	
							}
							global.applyCrdit(creditObj);
						}
						let inv_remaining_amount =Number(invoiceTotal)+Number(creditTotal);
						let bill_remaining_amount =Number(billTotal)+Number(billcreditTotal);
						let min_val=[];
						min_val.push(inv_remaining_amount);
						min_val.push(bill_remaining_amount);
						log.debug('min_val',min_val);
						let min_amt = Math.min(...min_val);
						log.debug('min_amt', min_amt);
						invObj['line'] = [{
							'amount': min_amt,
							'account': apAccount,
							'type': 'debit',
							"linememo": apmemo.toString()
						}, {
							'amount': min_amt,
							'account': arAccount,
							'type': 'credit',
							"linememo":  armemo.toString()
						}]

						if(min_inv_bill.length>0&&min_amt>0) {
							let inv_JournalId =global.createJournals(invObj);
							log.debug('inv_JournalId',inv_JournalId)
							if (invoiceList.length > 0&&inv_JournalId) {
								let tran=[];
								invoiceList.push(inv_JournalId);
								log.debug('invoiceList',invoiceList)
								invAmount.push(min_amt);
								let paymentObj = {
										'journal': inv_JournalId,
										'entity': invObj.entityid,
										'type': 'customerpayment',
										'tran': invoiceList ,
										'payment':customerPayment,
										'amount':invAmount,
										'jeamount':min_amt
								};
								global.createPayment(paymentObj);
							}
							if(billList.length > 0&&inv_JournalId) {
								let tran1=[];
								billamount.push(min_amt)
								billList.push(inv_JournalId);
								let paymentObj = {
										'journal': inv_JournalId,
										'entity': billObj.entityid,
										'type': 'vendorpayment',
										'tran': billList,
										'payment':vendorPayment ,
										'amount':billamount,
										'jeamount':min_amt
								};
								global.createPayment(paymentObj);
							}
						}
					}
					else if (min_inv_bill.length>0) {
						let inv_JournalId = global.createJournals(invObj);
						log.debug('inv_JournalId',inv_JournalId)
						if (invoiceList.length > 0&&inv_JournalId) {
							let tran=[];
							invoiceList.push(inv_JournalId);
							log.debug('invoiceList',invoiceList)
							invAmount.push(min_amt);
							let paymentObj = {
									'journal': inv_JournalId,
									'entity': invObj.entityid,
									'type': 'customerpayment',
									'tran': invoiceList ,
									'payment':customerPayment,
									'amount':invAmount,
									'jeamount':min_amt
							};
							global.createPayment(paymentObj);
						}
						if(billList.length > 0&&inv_JournalId) {
							let tran1=[];
							billamount.push(min_amt)
							billList.push(inv_JournalId);
							log.debug('billList',billList);
							let paymentObj = {
									'journal': inv_JournalId,
									'entity': billObj.entityid,
									'type': 'vendorpayment',
									'tran': billList,
									'payment':vendorPayment ,
									'amount':billamount,
									'jeamount':min_amt
							};
							global.createPayment(paymentObj);
						}
					}
					/* if (min_credit.length > 0) {
                    creditObj['line'] = [{
                        'amount': min_credit_amt,
                        'account': apAccount,
                        'type': 'debit',
                        "linememo": ''
                    }, {
                        'amount': min_credit_amt,
                        'account': arAccount,
                        'type': 'credit',
                        "linememo": ''
                    }]
                    let credit_JournalId = global.createJournals(creditObj);
                    log.debug('credit_JournalId', credit_JournalId);
                    if (credit_JournalId&&customer_credit_List.length>0) {
                        customer_credit_List.push(credit_JournalId);
                        let customer_creditpayObj = {
                            'journal': credit_JournalId,
                            'entity': creditObj.entityid,
                            'type': 'customerpayment',
                            'tran': customer_credit_List
                        }
                        global.createPayment(customer_creditpayObj);
                    }
                    if (credit_JournalId&&vendor_credit_List.length>0) {
                        vendor_credit_List.push(credit_JournalId)
                        let vendor_creditpayObj = {
                            'journal': credit_JournalId,
                            'entity': billcreditObj.entityid,
                            'type': 'vendorpayment',
                            'tran': vendor_credit_List
                        }
                        global.createPayment(vendor_creditpayObj);
                    }
                }*/
				} catch (e) {
					log.debug('Skipped-' + recordId + '', e);
				}
			}
			let summarize = (summaryContext) => {
				try {
					let type = summaryContext.toString();
					let totalProcess = 0;
					summaryContext.output.iterator().each(function (key, value) {
						totalProcess++;
						return true;
					});
					// Log details about the total number of pairs saved.
					log.audit("Total Records:" + totalProcess, "Time:" + summaryContext.seconds + " | Yields : " + summaryContext.yields + "| Concurrency :" + summaryContext.concurrency + "| Usage: " + summaryContext.usage);

				} catch (e) {
					log.error('error', e)
				}
			}
			return {getInputData,map,summarize};
		});