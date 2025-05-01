using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace 病歷系統
{
    public partial class Form1 : Form
    {
        private readonly string _connectionString = ConfigurationManager.ConnectionStrings["ClinicDatabaseConnectionString"].ConnectionString;

        private Label label1;
        private Label label2;
        private DateTimePicker birthdatePicker;
        private Button addButton;
        private Label label3;
        private DateTimePicker searchDatePicker;
        private Button searchButton;
        private ListView patientsListView;
        private ColumnHeader columnHeader1;
        private ColumnHeader columnHeader2;
        private ColumnHeader columnHeader3;
        private TextBox nameTextBox;

        public Form1()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.label1 = new System.Windows.Forms.Label();
            this.nameTextBox = new System.Windows.Forms.TextBox();
            this.label2 = new System.Windows.Forms.Label();
            this.birthdatePicker = new System.Windows.Forms.DateTimePicker();
            this.addButton = new System.Windows.Forms.Button();
            this.label3 = new System.Windows.Forms.Label();
            this.searchDatePicker = new System.Windows.Forms.DateTimePicker();
            this.searchButton = new System.Windows.Forms.Button();
            this.patientsListView = new System.Windows.Forms.ListView();
            this.columnHeader1 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader2 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.columnHeader3 = ((System.Windows.Forms.ColumnHeader)(new System.Windows.Forms.ColumnHeader()));
            this.SuspendLayout();
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Location = new System.Drawing.Point(63, 44);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(65, 12);
            this.label1.TabIndex = 0;
            this.label1.Text = "病人姓名：";
            // 
            // nameTextBox
            // 
            this.nameTextBox.Location = new System.Drawing.Point(135, 33);
            this.nameTextBox.Name = "nameTextBox";
            this.nameTextBox.Size = new System.Drawing.Size(100, 22);
            this.nameTextBox.TabIndex = 1;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Location = new System.Drawing.Point(63, 85);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(65, 12);
            this.label2.TabIndex = 2;
            this.label2.Text = "出生日期：";
            // 
            // birthdatePicker
            // 
            this.birthdatePicker.Location = new System.Drawing.Point(135, 74);
            this.birthdatePicker.Name = "birthdatePicker";
            this.birthdatePicker.Size = new System.Drawing.Size(200, 22);
            this.birthdatePicker.TabIndex = 3;
            // 
            // addButton
            // 
            this.addButton.Location = new System.Drawing.Point(365, 57);
            this.addButton.Name = "addButton";
            this.addButton.Size = new System.Drawing.Size(75, 23);
            this.addButton.TabIndex = 4;
            this.addButton.Text = "新增病人";
            this.addButton.UseVisualStyleBackColor = true;
            this.addButton.Click += new System.EventHandler(this.addButton_Click);
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Location = new System.Drawing.Point(63, 139);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(65, 12);
            this.label3.TabIndex = 5;
            this.label3.Text = "查詢生日：";
            // 
            // searchDatePicker
            // 
            this.searchDatePicker.Location = new System.Drawing.Point(135, 128);
            this.searchDatePicker.Name = "searchDatePicker";
            this.searchDatePicker.Size = new System.Drawing.Size(200, 22);
            this.searchDatePicker.TabIndex = 6;
            // 
            // searchButton
            // 
            this.searchButton.Location = new System.Drawing.Point(365, 127);
            this.searchButton.Name = "searchButton";
            this.searchButton.Size = new System.Drawing.Size(75, 23);
            this.searchButton.TabIndex = 7;
            this.searchButton.Text = "查詢";
            this.searchButton.UseVisualStyleBackColor = true;
            this.searchButton.Click += new System.EventHandler(this.searchButton_Click);
            // 
            // patientsListView
            // 
            this.patientsListView.Columns.AddRange(new System.Windows.Forms.ColumnHeader[] {
            this.columnHeader1,
            this.columnHeader2,
            this.columnHeader3});
            this.patientsListView.HideSelection = false;
            this.patientsListView.Location = new System.Drawing.Point(65, 173);
            this.patientsListView.Name = "patientsListView";
            this.patientsListView.Size = new System.Drawing.Size(270, 127);
            this.patientsListView.TabIndex = 8;
            this.patientsListView.UseCompatibleStateImageBehavior = false;
            this.patientsListView.View = System.Windows.Forms.View.Details;
            // 
            // columnHeader1
            // 
            this.columnHeader1.Text = "病人ID";
            this.columnHeader1.Width = 63;
            // 
            // columnHeader2
            // 
            this.columnHeader2.Text = "姓名";
            this.columnHeader2.Width = 95;
            // 
            // columnHeader3
            // 
            this.columnHeader3.Text = "生日";
            this.columnHeader3.Width = 107;
            // 
            // Form1
            // 
            this.ClientSize = new System.Drawing.Size(645, 402);
            this.Controls.Add(this.patientsListView);
            this.Controls.Add(this.searchButton);
            this.Controls.Add(this.searchDatePicker);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.addButton);
            this.Controls.Add(this.birthdatePicker);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.nameTextBox);
            this.Controls.Add(this.label1);
            this.Name = "Form1";
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        private void addButton_Click(object sender, EventArgs e)
        {
            string name = nameTextBox.Text;
            DateTime birthdate = birthdatePicker.Value;

            if (string.IsNullOrWhiteSpace(name))
            {
                MessageBox.Show("病人姓名為必填。");
                return;
            }

            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    connection.Open();
                    string query = "INSERT INTO Patients (Name, Birthdate) VALUES (@Name, @Birthdate)";
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Name", name);
                        command.Parameters.AddWithValue("@Birthdate", birthdate);
                        int rowsAffected = command.ExecuteNonQuery();
                        if (rowsAffected > 0)
                        {
                            MessageBox.Show($"病人 '{name}' 新增成功。");
                            nameTextBox.Clear();
                        }
                        else
                        {
                            MessageBox.Show("新增病人失敗。");
                        }
                    }
                }
            }
            catch (SqlException ex)
            {
                MessageBox.Show($"新增病人時發生錯誤：{ex.Message}");
            }
        }

        private void searchButton_Click(object sender, EventArgs e)
        {
            DateTime searchBirthdate = searchDatePicker.Value.Date;
            patientsListView.Items.Clear();

            try
            {
                using (SqlConnection connection = new SqlConnection(_connectionString))
                {
                    connection.Open();
                    string query = "SELECT PatientID, Name, Birthdate FROM Patients WHERE Birthdate = @Birthdate";
                    using (SqlCommand command = new SqlCommand(query, connection))
                    {
                        command.Parameters.AddWithValue("@Birthdate", searchBirthdate);
                        using (SqlDataReader reader = command.ExecuteReader())
                        {
                            if (reader.HasRows)
                            {
                                while (reader.Read())
                                {
                                    ListViewItem item = new ListViewItem(reader["PatientID"].ToString());
                                    item.SubItems.Add(reader["Name"].ToString());
                                    item.SubItems.Add(reader["Birthdate"] == DBNull.Value ? "" : ((DateTime)reader["Birthdate"]).ToString("yyyy-MM-dd"));
                                    patientsListView.Items.Add(item);
                                }
                            }
                            else
                            {
                                MessageBox.Show($"沒有找到生日為 {searchBirthdate:yyyy-MM-dd} 的病人。");
                            }
                        }
                    }
                }
            }
            catch (SqlException ex)
            {
                MessageBox.Show($"查詢病人資料時發生錯誤：{ex.Message}");
            }
        }
    }
}
