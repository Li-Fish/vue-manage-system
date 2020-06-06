<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 考勤列表
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.title_prefix" placeholder="标题" class="handle-input mr10" @keyup.enter.native="handleSearch()"></el-input>
                <el-input v-model="query.creator" placeholder="创建者" class="handle-input mr10" @keyup.enter.native="handleSearch()"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="success" icon="el-icon-plus" @click="handleAdd">新增考勤</el-button>
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
                <el-table-column prop="title" label="标题"></el-table-column>
                <el-table-column prop="creator" label="创建者"></el-table-column>
                <el-table-column prop="info" label="备注"></el-table-column>
                <el-table-column prop="type" label="类型"></el-table-column>
                <el-table-column prop="code" label="考勤码">

                </el-table-column>
                <el-table-column label="操作" width="450" align="center">
                    <template slot-scope="scope">
                        <el-button
                                icon="el-icon-edit"
                                @click="handleGenerateCode(scope.$index, scope.row)"
                        >刷新考勤码</el-button>
                        <el-button
                                icon="el-icon-edit"
                                @click="handleTimeEdit(scope.$index, scope.row)"
                        >时间段</el-button>
                        <el-button
                            icon="el-icon-edit"
                            @click="handleEdit(scope.$index, scope.row)"
                        >编辑</el-button>
                        <el-button
                            type="danger"
                            icon="el-icon-delete"
                            @click="handleDelete(scope.$index, scope.row)"
                        >删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
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

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="70px">
                <el-form-item label="标题">
                    <el-input v-model="form.title"></el-input>
                </el-form-item>
                <el-form-item label="内容">
                    <el-input v-model="form.info"></el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-input v-model="form.type"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 时间段对话框 -->
        <el-dialog title="考勤时间段" :visible.sync="timeEditVisible" width="30%">
            <el-checkbox-group v-model="week_list" style="text-align: center; margin-bottom: 30px">
                <el-checkbox-button v-for="week in weeks" :label="week" :key="week">{{week}}</el-checkbox-button>
            </el-checkbox-group>
            <el-form ref="form" :model="form" label-width="70px">
                <template v-for="(item, index) in time_list">
                    <el-form-item>
                        <el-time-picker
                                is-range
                                v-model="time_list[index]"
                                range-separator="至"
                                start-placeholder="开始时间"
                                end-placeholder="结束时间"
                                placeholder="选择时间范围">
                        </el-time-picker>
                        <el-button type="danger" circle icon="el-icon-minus" @click="time_list.splice(index, 1)"></el-button>
                    </el-form-item>
                </template>

                <el-form-item style="text-align: center">
                    <el-button type="success" icon="el-icon-plus" @click="time_list.push([new Date(), new Date()])">新增时间段</el-button>
                </el-form-item>

            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="timeEditVisible = false">关 闭</el-button>
                <el-button type="primary" @click="handleTimeAdd">保 存</el-button>
            </span>
        </el-dialog>

        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="30%">
            <el-form ref="add_form" :model="add_form" label-width="70px">
                <el-form-item label="标题">
                    <el-input v-model="add_form.title"></el-input>
                </el-form-item>
                <el-form-item label="内容">
                    <el-input v-model="add_form.info"></el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-input v-model="add_form.type"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { getData } from '../../api/index';
import { dateToInt, intToDate } from '../../utils/tools';
export default {
    name: 'basetable',
    data() {
        return {
            query: {
                title_prefix: '',
                creator: '',
                pageIndex: 1,
                pageSize: 10
            },
            tableData: [],
            multipleSelection: [],
            editVisible: false,
            addVisible: false,
            timeEditVisible: false,
            time_list: [],
            week_list: [],
            weeks: [1, 2, 3, 4, 5, 6, 7],
            pageTotal: 0,
            form: {},
            add_form: {},
            idx: -1,
            id: -1
        };
    },
    created() {
        this.getData();
    },
    activated() {
        this.getData();
    },
    methods: {
        getData() {
            getData("attendance_table", this.query).then(res => {
                this.tableData = res.list;
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
                    getData("delete_attendance", {id: row.id}).then(res => {
                        this.$message.success('删除成功');
                        this.tableData.splice(index, 1);
                    }).catch(error => {
                        this.$message.error('删除失败');
                    })

                })
                .catch(() => {});
        },

        handleGenerateCode(index, row) {
            this.$confirm('确定要刷新吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    getData("change_attendance_code", {id: row.id}).then(res => {
                        this.$message.success('刷新成功');
                        this.getData()
                    }).catch(error => {
                        this.$message.error('刷新失败');
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
                    getData("delete_attendance", {id: this.multipleSelection[i].id}).then(res => {
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
        // 编辑操作
        handleEdit(index, row) {
            this.idx = index;
            this.form = {
                title: row.title,
                info: row.info,
                type: row.type,
                row: row
            }
            this.editVisible = true;
        },

        handleTimeEdit(index, row) {
            this.$confirm('修改时间会使之前考勤失效，确定要修改吗？', '提示', {
                type: 'warning'
            })
                .then(() => {

                    this.time_list = []

                    let query = {
                        attendance_id: row.id
                    }

                    getData("get_attendance_date", query).then(res => {
                        for(let item of res.time_list) {
                            this.time_list.push([intToDate(item[0]), intToDate(item[1])])

                        }
                        console.log(this.time_list)
                        this.week_list = res.week_list
                        this.now_time_attendance = row.id
                        this.timeEditVisible = true
                    }).catch(error => {
                        console.log(error)
                        this.$message.error(`加载失败`);
                    });

                })
                .catch(() => {});


        },

        handleTimeAdd() {
            let time_list = []
            for(let item of this.time_list) {
                time_list.push([dateToInt(item[0]), dateToInt(item[1])])
            }

            {
                let tmp = time_list
                tmp.sort((a, b)=>{
                    return a[0] - b[0]
                })
                console.log(tmp)
                for (let i = 1; i < tmp.length; ++i) {
                    if (tmp[i][0] < tmp[i - 1][1]) {
                        this.$message.error("修改失败，时间段不能重叠")
                        return
                    }
                }
            }

            this.timeEditVisible = false

            let query = {
                attendance_id: this.now_time_attendance,
                date_list: time_list,
                week_list: this.week_list
            }

            getData("upload_attendance_date", query).then(res => {
                this.$message.success(`修改成功`);
                this.getData()
            }).catch(error => {
                this.$message.error(`修改失败`);
            });
        },


        // 新增操作
        handleAdd() {
            this.add_form = {
                title: "",
                info: "",
                type: 1,
            }
            this.addVisible = true;
        },

        saveAdd() {
            this.addVisible = false;
            let query = {
                title : this.add_form.title,
                info : this.add_form.info,
                type : this.add_form.type
            }

            getData("add_attendance", query).then(res => {
                this.$message.success(`添加成功`);
                this.getData()
            }).catch(error => {
                this.$message.error(`添加失败`);
            });
        },

        // 保存编辑
        saveEdit() {
            this.editVisible = false;

            let query = {
                id : this.tableData[this.idx].id,
                title : this.form.title,
                info : this.form.info,
                type : this.form.type
            }

            getData("update_attendance", query).then(res => {
                this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                this.form.row.title = this.form.title;
                this.form.row.info = this.form.info;
                this.form.row.type = this.form.type;
            }).catch(error => {
                this.$message.error(`修改第 ${this.idx + 1} 行失败`);
            });


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
