<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="8">
                <el-card shadow="hover" class="mgb20" style="height:200px;">
                    <div class="user-info">
                        <img src="../../assets/img/user.png" class="user-avator" alt />
                        <div class="user-info-cont">
                            <div class="user-info-name">{{name}}</div>

                        </div>
                    </div>
                </el-card>
                <el-card shadow="hover" style="height:500px;">
                    <div slot="header" class="clearfix">
                        <span>最近考勤</span>
                    </div>
                    <el-table :show-header="true" :data="attendance_list" style="width:100%;">
                        <el-table-column label="姓名" prop="name">
                        </el-table-column>
                        <el-table-column prop="date" label="时间"></el-table-column>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
            <el-col :span="16">
                <el-card shadow="hover" class="mgb20">
                    <schart ref="line" class="schart mgb20" canvasId="line" :options="options2"></schart>
                </el-card>
                <el-card shadow="hover" class="">
                    <schart ref="bar" class="schart " canvasId="bar" :options="options"></schart>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import Schart from 'vue-schart';
import bus from '../common/bus';
import { getData } from '../../api';
import { getWeek, timeConverter } from '../../utils/tools';
export default {
    name: 'dashboard',
    data() {
        return {
            name: localStorage.getItem('ms_username'),
            attendance_list: [],
            options: {
                type: 'bar',
                title: {
                    text: '最近七日考勤人数'
                },
                xRorate: 25,
                labels: ['1', '2', '3'],
                datasets: [
                    {
                        label: '人数',
                        data: [234, 278, 270, 190, 230]
                    },
                ]
            },
            options2: {
                type: 'line',
                title: {
                    text: '今日考勤人数'
                },
                labels: [],
                datasets: [
                    {
                        label: '人数',
                        data: [164, 178, 150, 135, 160]
                    },
                ]
            }
        };
    },

    created() {
        this.getData();
    },
    activated() {
        this.getData();
    },

    components: {
        Schart
    },
    computed: {
        role() {
            return this.name === 'admin' ? '超级管理员' : '普通用户';
        }
    },

    methods: {
        getData() {
            getData("get_dashboard_data", this.query).then(res => {
                this.attendance_list = res.attendance_list
                for (let i = 0; i < this.attendance_list.length; ++i) {
                    this.attendance_list[i].date = timeConverter(this.attendance_list[i].date)
                }
                console.log(res)
                this.options2.labels = []
                for (let i = 0; i < 24; ++i) {
                    this.options2.labels.push(i)
                }
                this.options2.datasets[0].data = res.today_attendance_num

                this.options.labels = []
                for (let i = 0; i < 7; ++i) {
                    let day1 = new Date()
                    day1.setTime(day1.getTime() - 24 * 60 * 60 * 1000 * i)
                    this.options.labels.push(getWeek(day1))
                }
                this.options.labels.reverse()
                this.options.datasets[0].data = res.last_7days_attendance_num

            }).catch(error => {
                console.log(error)
                this.$message.error('获取数据失败');
            });
        }
    }
};
</script>


<style scoped>
.el-row {
    margin-bottom: 20px;
}

.grid-content {
    display: flex;
    align-items: center;
    height: 100px;
}

.grid-cont-right {
    flex: 1;
    text-align: center;
    font-size: 14px;
    color: #999;
}

.grid-num {
    font-size: 30px;
    font-weight: bold;
}

.grid-con-icon {
    font-size: 50px;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
    color: #fff;
}

.grid-con-1 .grid-con-icon {
    background: rgb(45, 140, 240);
}

.grid-con-1 .grid-num {
    color: rgb(45, 140, 240);
}

.grid-con-2 .grid-con-icon {
    background: rgb(100, 213, 114);
}

.grid-con-2 .grid-num {
    color: rgb(45, 140, 240);
}

.grid-con-3 .grid-con-icon {
    background: rgb(242, 94, 67);
}

.grid-con-3 .grid-num {
    color: rgb(242, 94, 67);
}

.user-info {
    display: flex;
    align-items: center;
    padding-bottom: 20px;
    border-bottom: 2px solid #ccc;
    margin-bottom: 20px;
}

.user-avator {
    width: 120px;
    height: 120px;
    border-radius: 50%;
}

.user-info-cont {
    padding-left: 50px;
    flex: 1;
    font-size: 14px;
    color: #999;
}

.user-info-cont div:first-child {
    font-size: 30px;
    color: #222;
}

.user-info-list {
    font-size: 14px;
    color: #999;
    line-height: 25px;
}

.user-info-list span {
    margin-left: 70px;
}

.mgb20 {
    margin-bottom: 20px;
}

.todo-item {
    font-size: 14px;
}

.todo-item-del {
    text-decoration: line-through;
    color: #999;
}

.schart {
    width: 100%;
    height: 300px;
}
</style>
