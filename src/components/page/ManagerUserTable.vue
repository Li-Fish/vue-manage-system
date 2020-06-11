<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 管理用户
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.username" placeholder="用户名" class="handle-input mr10" @keyup.enter.native="handleSearch()"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="success" icon="el-icon-plus" @click="handleAdd">新增用户</el-button>
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
                <el-table-column prop="username" label="用户名"></el-table-column>
                <el-table-column prop="password" label="密码"></el-table-column>
                <el-table-column label="操作" width="200" align="center">
                    <template slot-scope="scope">
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
                <el-form-item label="用户名">
                    <el-input v-model="form.username"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="form.password"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="30%">
            <el-form ref="add_form" :model="add_form" label-width="70px">
                <el-form-item label="用户名">
                    <el-input v-model="add_form.username"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="add_form.password"></el-input>
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
    import { base_url, getData, uploadFile } from '../../api/index';
export default {
    name: 'basetable',
    data() {
        return {
            query: {
                username: '',
                pageIndex: 1,
                pageSize: 10
            },
            tableData: [],
            multipleSelection: [],
            editVisible: false,
            addVisible: false,
            imgVisible: false,
            pageTotal: 0,
            form: {},
            add_form: {},
            idx: -1,
            id: -1,
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
            getData("manager_user_table", this.query).then(res => {
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
                    getData("delete_manager_user", {id: row.id}).then(res => {
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
                    getData("delete_manager_user", {id: this.multipleSelection[i].id}).then(res => {
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
                username: row.username,
                password: row.password,
                row: row
            }
            this.editVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.editVisible = false;

            let query = {
                id : this.tableData[this.idx].id,
                username : this.form.username,
                password : this.form.password
            }

            getData("update_manager_user", query).then(res => {
                this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                this.form.row.name = this.form.name;
                this.getData()
            }).catch(error => {
                this.$message.error(`修改第 ${this.idx + 1} 行失败`);
            });
        },

        handleAdd() {
            this.add_form = {
                username: "",
                password: ""
            }
            this.addVisible = true;
        },

        saveAdd() {
            let query = {
                username : this.add_form.username,
                password : this.add_form.password,
            }
            getData("add_manager_user", query).then(res => {
                this.$message.success(`添加成功`);
                this.getData()
            }).catch(error => {
                this.$message.error(`添加失败`);
            });
            this.addVisible = false;
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



.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}
.avatar-uploader .el-upload:hover {
    border-color: #409EFF;
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
}
.avatar {
    width: 178px;
    height: 178px;
    display: block;
}
</style>
