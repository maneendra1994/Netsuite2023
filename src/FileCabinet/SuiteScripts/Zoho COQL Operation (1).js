/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 *@NModuleScope SameAccount
 * Author -Raja
 * Date - 04/28/2021
 */
define(['N/https', 'N/record', 'N/search', 'N/runtime', 'N/task'], function (https, record, search, runtime, task) {

	function execute() {
		try {
			var scriptObj = runtime.getCurrentScript();
			var offset = scriptObj.getParameter({ name: 'custscript_offset' });
			var recordNo = scriptObj.getParameter({ name: 'custscript_record_no' });
			var url = 'https://accounts.zoho.eu/oauth/v2/token';
			var headers = { 'content-type': 'application/x-www-form-urlencoded' };
			var data = {
					'client_id': '1000.WPFVHYEPC8B0AIY59DCG5UV35Q2D2C',
					'client_secret': '9de1691f9d79453607e37e7008f6cafab04e6dece4',
					'grant_type': 'refresh_token',
					'refresh_token': '1000.b44110619a5fdace7e0434d6d75a4581.bf8d56ee9ee42c1c34f1d9a2546133a6'
			};
			ZE2FkRXlZHcAAAAAAAAAT4cXqdHAs4XE7dB0nEgAAi4
			var accessToken = getAccessToken(url, headers, data);
			var apiHeaders = {
					'content-type': 'application/json',
					'Authorization': accessToken
			}
			var coqlUrl='https://www.zohoapis.eu/crm/v2/coql';
			if (offset == null || offset == undefined || offset == '') {
				offset = 0;
			}
			if (recordNo == null || recordNo == undefined || recordNo == '') {
				recordNo = 0;
			}
			log.debug('offset  :' + offset, 'recordNo :' + recordNo)
			var query = 'select Account_Name,Multiplier,Ad_Network_Id,MultiplierID,Account_Number,Owner,Home_Region,Company,Currency,Layout,Department,Description,Billing_Code,Billing_State,Billing_Street,Billing_City, Billing_Country,Shipping_City,Shipping_Code,Shipping_Country,Shipping_State,Shipping_Street,Created_By,MainEmail,Phone,Publisher_ID,Payment_Terms,Website from Accounts where Account_Name is not null limit 200 offset ' + offset;
			var reqBody = {
					'select_query': query
			}
			var zohoData = getDataFromZoho(coqlUrl, apiHeaders, reqBody);
			if (zohoData.data.length > 0) {
				var info = zohoData.info.more_records;
				zohoData = zohoData.data;
				log.debug('No of Records from Query : ' + zohoData.length, 'More Records : ' + info);
				for (var i = recordNo; i < zohoData.length; i++) {
					try {
						var zohoRecordId = zohoData[i].id;
						var currency = zohoData[i].Currency
						var ownerId = zohoData[i].Owner.id;
						var company = zohoData[i].Company;
						var description = zohoData[i].Description;
						var email = zohoData[i].MainEmail;
						var website = zohoData[i].Website;
						var department = zohoData[i].Department;
						var publisherId = zohoData[i].Publisher_ID;
						var homeRegion = zohoData[i].Home_Region;
						var phone = zohoData[i].Phone;
						var accountName = zohoData[i].Account_Name;
						var accountNo = zohoData[i].Account_Number;
						var layout = zohoData[i].Layout;
						var createdBy = zohoData[i].Created_By.id;
						var multiplier = zohoData[i].Multiplier;
						var multiplierId = zohoData[i].MultiplierID;
						var networkId = zohoData[i].Ad_Network_Id;
						var billStreet = zohoData[i].Billing_Street;
						var billCity = zohoData[i].Billing_City;
						var billCode = zohoData[i].Billing_Code;
						var billState = zohoData[i].Billing_State;
						var billCountry = zohoData[i].Billing_Country;
						var shipStreet = zohoData[i].Shipping_Street
						var shipCity = zohoData[i].Shipping_City
						var shipCode = zohoData[i].Shipping_Code
						var shipState = zohoData[i].Shipping_State
						var shipCountry = zohoData[i].Shipping_Country
						var pmtTerms = zohoData[i].Payment_Terms
						var billingAddress = zohoData[i].Billing_Street + zohoData[i].Billing_City + zohoData[i].Billing_Code + zohoData[i].Billing_State + zohoData[i].Billing_Country;
						var shippingAddress = zohoData[i].Shipping_Street + zohoData[i].Shipping_City + zohoData[i].Shipping_Code + zohoData[i].Shipping_State + zohoData[i].Shipping_Country; 
                      log.debug('recordExists(zohoRecordId)',recordExists(zohoRecordId));
						if (recordExists(zohoRecordId)) {
							var id = recordExists(zohoRecordId)
							var customZohoRecord = record.load({
								type: 'customrecord_zoho_integration',
								id: id,
								isDynamic: true
							});
							customZohoRecord.setValue('custrecord_is_processed', false);
						} else {
							var customZohoRecord = record.create({
								type: 'customrecord_zoho_integration',
								isDynamic: true
							});
						}
                      log.debug('phone'+phone,'website'+website+'accountName'+accountName);
						if (layout == '325467000000032035') {
							customZohoRecord.setValue('custrecord_is_vendor', true);
							customZohoRecord.setValue('custrecord_publisher_id', publisherId);
						}
						else if (layout == '325467000014380391') {
							customZohoRecord.setValue('custrecord_is_customer', true);
							customZohoRecord.setValue('custrecord_publisher_id', networkId);
						}
						customZohoRecord.setValue('custrecord_account_owner', ownerId);
						customZohoRecord.setValue('custrecord_company', company);
						customZohoRecord.setValue('custrecord_description', description);
						customZohoRecord.setValue('custrecord_email', email);
                        //if(website!=null&&website!='')
						//customZohoRecord.setValue('custrecord_website', website);
						customZohoRecord.setValue('custrecord_department', department);
						customZohoRecord.setValue('custrecord_home_region', homeRegion);
                        if(phone!=null&&phone!='')
						customZohoRecord.setValue('custrecord_phone', phone);
						customZohoRecord.setValue('custrecord_name', accountName);
						customZohoRecord.setValue('custrecord_record_id', zohoRecordId);
						customZohoRecord.setValue('custrecord_account_no', accountNo);
						customZohoRecord.setValue('custrecord_created_by', createdBy);
						customZohoRecord.setValue('custrecord_multiplier_id', multiplierId)
						customZohoRecord.setValue('custrecord_multiplier', multiplier)
						customZohoRecord.setValue('custrecord_billing_address', billingAddress);
						customZohoRecord.setValue('custrecord_shipping_address', shippingAddress);
						customZohoRecord.setValue('custrecord_billing_street', billStreet);
						customZohoRecord.setValue('custrecord_billing_city', billCity);
						customZohoRecord.setValue('custrecord_billing_code', billCode);
						customZohoRecord.setValue('custrecord_billing_state', billState);
						customZohoRecord.setValue('custrecord_billing_country', billCountry);
						customZohoRecord.setValue('custrecord_shipping_street', shipStreet);
						customZohoRecord.setValue('custrecord_shipping_city', shipCity);
						customZohoRecord.setValue('custrecord_shipping_code', shipCode);
						customZohoRecord.setValue('custrecord_shipping_state', shipState);
						customZohoRecord.setValue('custrecord_shipping_country', shipCountry);
						customZohoRecord.setValue('custrecord_currency', currency);
						customZohoRecord.setValue('custrecord_pmt_terms', pmtTerms);
						var recordId = customZohoRecord.save();
                      log.debug('recordId',recordId);
					} catch (error) {
						log.debug('Error While Creating Record', error);
					}
					var remusg = runtime.getCurrentScript().getRemainingUsage();
					if (remusg <= 200) {
						var no = i + 1
						var off = offset +200;
						log.debug('reschedule at ' + no, { remusg: remusg, 'offset': offset })
						resheduleScript(off, no);
						break;
					}
				}
			}
			var remusg = runtime.getCurrentScript().getRemainingUsage();

			if (info == true) {
				log.debug('remusg', remusg)
				var off = offset + 200;
				resheduleScript(off);
			}
		} catch (error) {
			log.debug('Error', error)
		}
	};
	var recordExists = function (id) {
		var flag = false;
		var id;
		var customrecord_zoho_integrationSearchObj = search.create({
			type: "customrecord_zoho_integration",
			filters:
				[
					["custrecord_record_id", "is", id]
					],
					columns:
						[
							search.createColumn({
								name: "id",
								sort: search.Sort.ASC,
								label: "ID"
							})
							]
		});
		var searchResultCount = customrecord_zoho_integrationSearchObj.runPaged().count;
		customrecord_zoho_integrationSearchObj.run().each(function (result) {
			id = result.getValue({
				name: "id",
				sort: search.Sort.ASC,
				label: "ID"
			})
			return false;
		});
		if (searchResultCount > 0) {
			flag = id
		}
		return flag;
	}
	var resheduleScript = function (offset, no) {
		try {
			if (offset && no) {
				var param = {
						'custscript_record_no': no,
						'custscript_offset': offset
				}
			}
			else if (offset) {
				var param = {
						'custscript_offset': offset
				}
			}
			var scheduledScriptTask = task.create({
				taskType: task.TaskType.SCHEDULED_SCRIPT,
				scriptId: runtime.getCurrentScript().id,
				deploymentId: 'customdeploy2',
				params: param
			});
			return scheduledScriptTask.submit();
		} catch (Error) {
			log.error('Error in resheduleScript --> ', {
				Error: Error
			})
		}

	}
	var getAccessToken = function (url, headers, body) {
		try {
			var response = https.post({
				url: url,
				body: body,
				headers: headers
			});
			var res = JSON.parse(response.body)
			var access_token = res.access_token
			return "Zoho-oauthtoken " + access_token
		} catch (error) {
			log.debug('Error in getAccessToken', error);
		}
	}

	var getDataFromZoho = function (url, apiHeaders, reqBody) {
		try {
			var zoho_response = https.post({
				url: url,
				headers: apiHeaders,
				body: JSON.stringify(reqBody)
			});
			var response = JSON.parse(zoho_response.body);
			return response;
		} catch (error) {
			log.debug('Error in getDataFromZoho', error);
		}
	}
	return {
		execute: execute
	}
});
