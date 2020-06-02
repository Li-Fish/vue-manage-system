<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 考勤用户
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="query.name" placeholder="姓名" class="handle-input mr10" @keyup.enter.native="handleSearch()"></el-input>
                <el-input v-model="query.attendance" placeholder="所属考勤" class="handle-input mr10" @keyup.enter.native="handleSearch()"></el-input>
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
                <el-table-column prop="name" label="姓名"></el-table-column>
                <el-table-column prop="attendance_title" label="所属考勤"></el-table-column>
                <el-table-column label="操作" width="300" align="center">
                    <template slot-scope="scope">
                        <el-button
                                @click="getPhoto(scope.$index, scope.row)"
                        >查看图片</el-button>
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

        <!-- 照片弹出框 -->
        <el-dialog title="图片" :visible.sync="imgVisible" width="30%">
            <el-image v-bind:src="imgURL" style="height: 500px" fit="contain"></el-image>
        </el-dialog>

        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :model="form" label-width="70px">
                <el-form-item label="姓名">
                    <el-input v-model="form.name"></el-input>
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
                <el-form-item label="姓名">
                    <el-input v-model="add_form.name"></el-input>
                </el-form-item>
                <el-form-item label="考勤ID">
                    <el-input v-model="add_form.attendance_id"></el-input>
                </el-form-item>
            </el-form>


            <el-upload
                    class="upload-demo"
                    ref="upload"
                    action="string"
                    accept="image/jpeg,image/png,image/jpg"
                    :file-list="fileList"
                    :show-file-list="false"
                    :http-request="UploadImage"
                    :auto-upload="false"
                    :on-change="onFileChange"
            >
                <el-image v-if="imageUrl" :src="imageUrl" fit="contain" class="avatar" style="width: 100%"></el-image>
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>

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
                name: '',
                attendance: '',
                pageIndex: 1,
                pageSize: 10
            },
            tableData: [],
            multipleSelection: [],
            editVisible: false,
            addVisible: false,
            imgVisible: false,
            imgURL: '',
            pageTotal: 0,
            form: {},
            add_form: {},
            idx: -1,
            id: -1,

            fileList: [],
            imageUrl: null,
        };
    },
    created() {
        this.getData();
    },
    activated() {
        this.getData();
    },
    methods: {
        onFileChange(file, fileList) {
            if (fileList.length > 0) {
                this.fileList = [fileList[fileList.length - 1]]  // 这一步，是 展示最后一次选择的csv文件
            }
            this.imageUrl = URL.createObjectURL(file.raw);
        },

        onBeforeUploadImage(file) {
            const file_type = ['image/jpeg', 'image/jpg', 'image/user.png']
            let isIMAGE = false;
            for (let x of file_type) {
                if (x === file.type) isIMAGE = true
            }
            const isLt1M = file.size / 1024 / 1024 < 1
            if (!isIMAGE) {
                this.$message.error('上传文件只能是图片格式!')
            }
            if (!isLt1M) {
                this.$message.error('上传文件大小不能超过 1MB!')
            }

            console.log(isIMAGE, isLt1M)

            return isIMAGE && isLt1M
        },
        UploadImage(param){
            if (!this.onBeforeUploadImage(param.file)) {
                console.log(param.file)
                return false
            }

            console.log('123')

            var jsonData = {name: this.add_form.name, attendance_id: parseInt(this.add_form.attendance_id, 10)}


            uploadFile('add_attendance_user', param.file, jsonData).then(res => {
                this.$message.success('添加成功')
                this.addVisible = false
            }).catch(error => {
                this.$message.error('添加失败')
            })
        },

        getPhoto(index, row) {

            let url = row.photo.split('/')
            let file_name = url[url.length - 1]
            let img_dir = url[url.length - 2]


            this.imgURL = base_url + 'image/' + img_dir + '/' + file_name
            this.imgVisible = true
        },

        getData() {
            getData("attendance_user_table", this.query).then(res => {
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
                    getData("delete_attendance_user", {id: row.id}).then(res => {
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
                    getData("delete_attendance_user", {id: this.multipleSelection[i].id}).then(res => {
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
                name: row.name,
                row: row
            }
            this.editVisible = true;
        },
        // 保存编辑
        saveEdit() {
            this.editVisible = false;

            let query = {
                id : this.tableData[this.idx].id,
                name : this.form.name,
            }

            getData("update_attendance_user", query).then(res => {
                this.$message.success(`修改第 ${this.idx + 1} 行成功`);
                this.form.row.name = this.form.name;
            }).catch(error => {
                this.$message.error(`修改第 ${this.idx + 1} 行失败`);
            });


        },

        handleAdd() {
            this.imageUrl = null
            this.fileList = []
            console.log(this.fileList)
            this.add_form = {
                name: "",
                attendance_id: "",
            }
            this.addVisible = true;
        },

        saveAdd() {
            this.$refs.upload.submit();
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
