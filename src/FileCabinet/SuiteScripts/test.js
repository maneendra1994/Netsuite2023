var obj=[{'id':'abc','qty':20,'sn':'abc1'},{'id':'abc','qty':20,'sn':'abc2'},{'id':'abc','qty':20,'sn':'abc3'}];var total=[10,30,20];var arry=[];
for (var i=0;i<total.length;i++){
    var remaningQty=total[i];
    console.log(obj);
    for(var k=0;k<obj.length;k++){
        var result=obj[k];
        var qty=obj[k].qty;
        if(remaningQty>0){
        remaningQty=Number(remaningQty)-Number(qty);console.log('remaningQty'+qty,remaningQty);
        if(remaningQty>=0){
           arry.push({'id':result.id,'qty':result.qty,'sn':result.sn,'total':result.id+'-'+total[i]});
            obj.splice(k, 1);
           // obj.push({'id':result.id,'qty':qtytotal,'sn':result.sn})
        }else if(remaningQty!=0){
            var qtytotal=remaningQty*-1;console.log('qtytotal',qtytotal);
            arry.push({'id':result.id,'qty':total[i],'sn':result.sn,'total':result.id+'-'+total[i]}); 
            obj.splice(k, 1);obj.push({'id':result.id,'qty':qtytotal,'sn':result.sn});
            remaningQty=0;
           //break;
        }
        }
        
    } console.log(obj);
} console.log(arry);
SELECT item.upccode, item.description,item.custitem_mb_item_carat_weight,item.itemid, InvtItemPriceHistory.price  FROM  Item INNER JOIN InvtItemPriceHistory ON ( InvtItemPriceHistory.item = item.ID )   INNER JOIN priceLevel ON
		                     ( InvtItemPriceHistory.pricetype = priceLevel.id )  WHERE  priceLevel.id=1 AND Item.itemid=?`; /*`SELECT item.upccode  AS upccode ,
                                item.description,item.custitem_mb_item_carat_weight,item.itemid  FROM item  
                                WHERE item.itemid=
					SELECT SUM(TAL.amount) AS GLAmount, 
 SUM(TAL.credit) AS credit, 
 SUM(TAL.debit) AS Debit, 
 SUM(TAL.netamount) AS netamount, 
 SUM(TL.foreignamount) AS foreignamount,
  A.acctnumber AS AccountNumber, 
  A.fullname AS AccountName,
FROM transactionaccountingline TAL 
LEFT JOIN transaction T
  ON T.id = TAL.transaction
LEFT JOIN account A 
  ON TAL.account = A.id
LEFT JOIN transactionline TL
  ON TL.transaction = TAL.transaction
LEFT JOIN accountingperiod AP
  ON T.postingperiod = AP.id
LEFT JOIN subsidiary S
  ON S.id = TL.subsidiary
WHERE TL.subsidiary = 1 AND 
  TAL.posting = 'T' AND
  TL.id = TAL.transactionline 
GROUP BY A.acctnumber,
  A.fullname


SELECT Transaction.trandate, Transaction.tranid, 
Transaction.type, Transaction.entity, 
SystemNote.newvalue,
 SystemNote.date, SystemNote.type,
 SystemNote.oldvalue, SystemNote.name
FROM 
TransactionLine,
Transaction 
LEFT OUTER JOIN SystemNote  ON
( SystemNote.RecordID = Transaction.ID )
AND  SystemNote.RecordTypeID = -30 
WHERE
Transaction."TYPE" IN ('SalesOrd')	
 AND transactionLine.mainline = 'T' AND transactionLine.subsidiary IN ('12')
AND
(Transaction.trandate BETWEEN TO_DATE( '2023-05-01', 'YYYY-MM-DD' ) AND TO_DATE( '2023-05-30', 'YYYY-MM-DD' ))
sai.m@continental.coffee
Netsuite@2023!

