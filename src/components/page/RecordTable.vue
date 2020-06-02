<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 考勤记录
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.name" placeholder="姓名" class="handle-input mr10" @keyup.enter.native="handleSearch()"></el-input>
                <el-input v-model="query.attendance" placeholder="考勤" class="handle-input mr10" @keyup.enter.native="handleSearch()"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button
                        type="danger"
                        icon="el-icon-delete"
                        class="handle-del mr10"
                        style="float: right"
                        @click="delAllSelection"
                >批量删除</el-button>
            </div>
            <el-table
                :data="tableData"
                border
                class="table"
                ref="multipleTable"
                header-cell-class-name="table-header"
                @selection-change="handleSelectionChange"
            >
                <el-table-column type="selection" width="55" align="center"></el-table-column>
                <el-table-column prop="id" label="ID" width="55" align="center"></el-table-column>
                <el-table-column prop="name" label="姓名"></el-table-column>
                <el-table-column prop="attendance_title" label="所属考勤"></el-table-column>
                <el-table-column prop="date" label="时间"></el-table-column>
                <el-table-column label="操作" width="200" align="center">
                    <template slot-scope="scope">
                        <el-button
                                @click="getPhoto(scope.$index, scope.row)"
                        >查看图片</el-button>
                        <el-button
                            type="danger"
                            icon="el-icon-delete"
                            @click="handleDelete(scope.$index, scope.row)"
                        >删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 照片弹出框 -->
            <el-dialog title="图片" :visible.sync="imgVisible" width="30%">
                <el-image v-bind:src="imgURL" style="height: 500px" fit="contain"></el-image>
            </el-dialog>

            <div class="pagination">
                <el-pagination
                    background
                    layout="total, prev, pager, next"
                    :current-page="query.pageIndex"
                    :page-size="query.pageSize"
                    :total="pageTotal"
                    @current-change="handlePageChange"
                ></el-pagination>
            </div>
        </div>
    </div>
</template>

<script>
    import { base_url, getData } from '../../api/index';
import { timeConverter } from '../../utils/tools';
export default {
    name: 'basetable',
    data() {
        return {
            query: {
                name: '',
                attendance: '',
                pageIndex: 1,
                pageSize: 10
            },
            tableData: [],
            multipleSelection: [],
            editVisible: false,
            pageTotal: 0,
            form: {},
            idx: -1,
            id: -1,
            imgVisible: false,
            imgURL: ''
        };
    },
    created() {
        this.getData();
    },

    activated() {
        this.getData();
    },


    beforeRouteUpdate (to, from, next) {
        console.log(to)
        console.log(from)
        console.log(23333333)
    },

    methods: {
        getPhoto(index, row) {

            let url = row.photo.split('/')
            let file_name = url[url.length - 1]
            let img_dir = url[url.length - 2]


            this.imgURL = base_url + 'image/' + img_dir + '/' + file_name
            this.imgVisible = true
        },

        getData() {
            getData("record_table", this.query).then(res => {
                this.tableData = res.list;
                for (let i = 0; i < this.tableData.length; ++i) {

                    this.tableData[i].date = timeConverter(this.tableData[i].date)
                }
                this.pageTotal = res.total_num;
            }).catch(error => {
                this.$message.error('获取数据失败');
            });
        },
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageIndex', 1);
            this.getData();
        },
        // 删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    getData("delete_record", {id: row.id}).then(res => {
                        this.$message.success('删除成功');
                        this.tableData.splice(index, 1);
                    }).catch(error => {
                        this.$message.error('删除失败');
                    })

                })
                .catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        delAllSelection() {
            const length = this.multipleSelection.length;

            if (length === 0) {
                this.$message.error("没有选择删除内容")
                return
            }

            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            }).then(()=>{
                    let str = '';
                    let count = 0, fail = 0

                    let waitList = []

                    for (let i = 0; i < length; i++) {
                    getData("delete_record", {id: this.multipleSelection[i].id}).then(res => {
                        count += 1
                    }).catch(error => {
                        fail += 1
                    }).finally(()=>{
                        if (count + fail === length) {
                            this.$message.success(`删除了${count}项记录`);
                            if (fail !== 0) {
                                this.$message.error(`${fail}项删除失败`)
                            }
                            this.getData()
                            this.multipleSelection = [];
                        }
                    })
                }
            })
        },
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'pageIndex', val);
            this.getData();
        }
    }
};
</script>

<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
</style>
