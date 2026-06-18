// Sample China Regions Data for Testing
// This is a sample file to demonstrate the data structure
// Replace this with your actual data from the converter.html

window.chinaCities = {
    "beijing": {
        name: "北京",
        type: "province",
        cities: {
            "beijing_city": { 
                name: "北京", 
                type: "city", 
                counties: [
                    { id: "chaoyang", name: "朝阳区" },
                    { id: "chongwen", name: "崇文区" },
                    { id: "xicheng", name: "西城区" },
                    { id: "dongcheng", name: "东城区" }
                ] 
            }
        }
    },
    "shanghai": {
        name: "上海",
        type: "province",
        cities: {
            "shanghai_city": { 
                name: "上海", 
                type: "city", 
                counties: [
                    { id: "huangpu", name: "黄浦区" },
                    { id: "luwan", name: "卢湾区" },
                    { id: "jing'an", name: "静安区" },
                    { id: "changning", name: "长宁区" }
                ] 
            }
        }
    },
    "guangdong": {
        name: "广东",
        type: "province",
        cities: {
            "guangzhou": { 
                name: "广州", 
                type: "city", 
                counties: [
                    { id: "tianhe", name: "天河区" },
                    { id: "yuexiu", name: "越秀区" }
                ] 
            },
            "shenzhen": { 
                name: "深圳", 
                type: "city", 
                counties: [
                    { id: "luohu", name: "罗湖区" },
                    { id: "futian", name: "福田区" }
                ] 
            }
        }
    },
    "zhejiang": {
        name: "浙江",
        type: "province",
        cities: {
            "hangzhou": { 
                name: "杭州", 
                type: "city", 
                counties: [
                    { id: "shangcheng", name: "上城区" },
                    { id: "xiacheng", name: "下城区" }
                ] 
            }
        }
    },
    "jiangsu": {
        name: "江苏",
        type: "province",
        cities: {
            "nanjing": { 
                name: "南京", 
                type: "city", 
                counties: [
                    { id: "jianye", name: "建邺区" },
                    { id: "gulou", name: "鼓楼区" }
                ] 
            },
            "suzhou": { 
                name: "苏州", 
                type: "city", 
                counties: [
                    { id: "wujiang", name: "吴江区" },
                    { id: "xiangcheng", name: "相城区" }
                ] 
            }
        }
    }
};

console.log('Sample China regions data loaded. Total provinces: ' + Object.keys(window.chinaCities).length);
