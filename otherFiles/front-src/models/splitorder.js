import { queryPickuptmpdetail, queryGoods, queryGoodsBasic, queryProductids, querysupplydictionry, queryPresaleById, queryErpClient, addPickUp, updatePickuptmpdetail, queryDeliveryWay} from '../services/api'

export default {
    namespace: 'splitorder',

    state: {
        state: {
            presaleid: '',
            pickupTmp: {},
        },
    },

    effects: {
        //  查询是否需要拆单
        *splitorder({payload, callback}, {call}) {
            const response = yield call(queryPickuptmpdetail, payload);
            if(response && response.status === 200) {
                // eslint-disable-next-line prefer-destructuring
                const presaleid = window.sessionStorage.presaleid;
                const areaMap = new Map();
                const params = "terms[0].value=3&terms[0].column=type";
                const supplyresp = yield call(querysupplydictionry, params);
                if(supplyresp && supplyresp.status === 200) {
                    supplyresp.result.data.forEach(item => {
                        areaMap.set(item.value,item.key);
                    })

                    //  0 需要拆单，1 不需要拆单，2 此单已完成拆单
                    let splitstatus = 0;
                    const testdata = [];
                    const tmpDatas = response.result.data;
                    const productidList =[];
                    const batchnoNo = [];
                    const tmpData =[];

                    if(tmpDatas.length === 0) {
                        splitstatus = 1;
                        testdata.push(splitstatus)
                        callback(testdata)
                    } else {
                        tmpDatas.forEach(item => {
                            if(item.completestatus ===1 && item.piece !==0) {
                                // 有整件数的
                                productidList.push(item.productid);
                                batchnoNo.push(item.batchno);
                                tmpData.push(item);
                            }
                            if( item.completestatus ===0 &&item.picknum !==0){
                                // 没有整件数的
                                productidList.push(item.productid);
                                batchnoNo.push(item.batchno);
                                tmpData.push(item);
                            }
                        })
                        if(tmpData.length===0){
                            splitstatus = 2;
                            testdata.push(splitstatus)
                            callback(testdata)
                        }

                        let terms = "";
                        batchnoNo.forEach(item=>{
                            terms += `terms[0].value=${item}&`;
                        })
                        terms += `terms[0].termType=in&terms[0].column=batchno&paging=false`;

                        const goodsbasicresp = yield call(queryGoodsBasic, terms);
                        if(goodsbasicresp && goodsbasicresp.status === 200) {
                            const goodsData = goodsbasicresp.result.data;
                            const goodsMap = new Map();
                            let goodterms = "terms[0].column=id&";
                            for(let g = 0; g < goodsData.length; g += 1){
                                if(productidList.indexOf(goodsData[g].productid >-1)){
                                goodsMap.set(goodsData[g].id,goodsData[g]); 
                                goodterms += `terms[0].value=${goodsData[g].goodid}&`;  
                                }
                            }

                            goodterms += "terms[0].termType=in";
                            const goodsresp = yield call(queryGoods, goodterms)
                            if(goodsresp && goodsresp.status === 200) {
                                const gData = goodsresp.result.data;
                                const goodArea  = new Map()

                                gData.forEach(item=>{
                                    goodArea.set(item.id,item.area);
                                });
                                if(productidList.length === 0){
                                    productidList.push(null);
                                }

                                const productidresp = yield call(queryProductids, productidList);
                                if(productidresp && productidresp.status === 200) {
                                    const productData = productidresp.result;
                                    for(let i=0; i<tmpData.length; i+=1){
                                        for(let z=0;z<productData.length;z+=1){
                                            if(tmpData[i].productid === productData[z].id){
                                                const product01Entity ={
                                                picture :productData[z].picture,
                                                seriesname :productData[z].productseries.seriesname,
                                                kindname :productData[z].productkind.kindname,
                                                productname:productData[z].productname,
                                                colorname : productData[z].colorname,
                                                
                                                }
                                                tmpData[i].key=`tmp${i}`;
                                                tmpData[i].status=0;
                                                tmpData[i].output=tmpData[i].picknum;
                                                
                                                tmpData[i].outpiece = tmpData[i].piece;
                                                tmpData[i].product01Entity =product01Entity;
                                                tmpData[i].remainnum=tmpData[i].picknum;
                                                // tmpData[i].goodentryids = goodsMap.get(tmpData[i].batchno).id;// 批次id
                                                tmpData[i].pieceweight = goodsMap.get(tmpData[i].goodentryid).pieceweight;// 每包净重
                                                tmpData[i].locations = goodsMap.get(tmpData[i].goodentryid).locations;// 位置信息
                                                tmpData[i].area = goodArea.get(goodsMap.get(tmpData[i].goodentryid).goodid);// 区域位置
                                                tmpData[i].areas = areaMap.get(`${tmpData[i].area}`);
                                            }
                                        }
                                    }
                                
                                    const querypresaleidresp = yield call(queryPresaleById, presaleid);
                                    const deliverywayterms = `sorts[0].value=no&sorts[0].order=asc`;
                                    
                                    if(querypresaleidresp && querypresaleidresp.status === 200) {
                                        const presaleData = querypresaleidresp.result;
                                        const paramss = `terms[0].value=${presaleData.clientid}&terms[0].column=id&pageIndex=0&pageSize=10`;
                                    
                                        const userlist = yield call(queryErpClient, paramss);
                                        if(userlist && userlist.status === 200) {
                                            const userList = userlist.result.data;
                                            presaleData.clientids = userList[0].name;
                                            presaleData.credit = userList[0].credit;
                                            const deliveryresp = yield call(queryDeliveryWay,deliverywayterms);
                                            if(deliveryresp &&deliveryresp.status ===200){
                                                const delivery = deliveryresp.result.data;
                                                delivery.forEach(delivItem=>{
                                                    if(`${presaleData.takeway}` === delivItem.value){
                                                      presaleData.takewayname=delivItem.name
                                                    }
                                                })
                                                
                                            }
                                            const pickupTmp = {
                                                pickupData:tmpData,
                                                dataTop:[presaleData],
                                            }
                                            const str = JSON.stringify(pickupTmp);
                                            testdata.push(splitstatus)
                                            testdata.push(str)
                                            callback(testdata)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }           
        },

        //  判断拆单是否成功
        *splitsuccess({payload, callback}, {call}) {
            const splictParmas = payload[0];
            const details = payload[1];
            const addpickresp = yield call(addPickUp, splictParmas);
            
            if(addpickresp && addpickresp.status === 200) {
                const tmpList =[];
                for(let i = 0;i < details.length; i += 1){
                    const vail ={ id:details[i].ids};
                    if(details[i].completestatus === 1 ){
                        vail.picknum = parseFloat(details[i].originalpicknum) - parseFloat(details[i].picknum);
                        vail.piece = parseFloat(details[i].originalpiece) - parseFloat(details[i].piece);
                    }else{
                        vail.picknum = parseFloat(details[i].originalpicknum) - parseFloat(details[i].picknum);
                    }
                    tmpList.push(vail);
                }
                const updatepickresp = yield call(updatePickuptmpdetail, tmpList);
                if(updatepickresp && updatepickresp.status === 200) {
                    callback('ok');
                }
            }
        },
    },
    reducers: {
        
    },
}
