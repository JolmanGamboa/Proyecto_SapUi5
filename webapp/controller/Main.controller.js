sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], 
function(Controller, MessageToast, JSONModel) {
    "use strict";

    return Controller.extend("proyectosapui5.controller.Main", {
        onInit: function() {
            // Cargar modelos para los selects
            this._loadSelectModels();
            
            // Inicializar modelo para los datos del formulario
            const oFormModel = new JSONModel({
                users: [] // Solo necesitamos el array de usuarios para la tabla
            });
            this.getView().setModel(oFormModel, "formData");
            
            // Cargar datos existentes
            this._loadSavedData();
        },
        
        _loadSelectModels: function() {
            const models = [
                {path: "./model/SelecTipoDocumento.json", name: "personalInformation"},
                {path: "./model/SelecPlaceBirth.json", name: "otherInformation1"},
                {path: "./model/SelecNationality.json", name: "otherInformation2"},
                {path: "./model/SelectGenre.json", name: "otherInformation3"},
                {path: "./model/SelecCivilStatus.json", name: "otherInformation4"},
                {path: "./model/SelecCountry.json", name: "addressInformation1"},
                {path: "./model/SelecProvince.json", name: "addressInformation2"},
                {path: "./model/SelecRegion.json", name: "addressInformation3"}
            ];
            
            models.forEach(model => {
                const oModel = new JSONModel();
                oModel.loadData(model.path);
                this.getView().setModel(oModel, model.name);
            });
        },
        
        _loadSavedData: function() {
            const oModel = new JSONModel();
            oModel.loadData("./model/data.json", null, false);
            
            // Si no hay usuarios en el archivo, inicializar con array vacío
            if (!oModel.getProperty("/users")) {
                oModel.setProperty("/users", []);
            }
            
            this.getView().setModel(oModel, "savedData");
            
            // Actualizar tabla con datos existentes
            const aUsers = oModel.getProperty("/users") || [];
            this.getView().getModel("formData").setProperty("/users", aUsers);
        },
        
        onSave: function() {
            const oView = this.getView();
            const oFormModel = oView.getModel("formData");
            const oSavedModel = oView.getModel("savedData");
            
            // Recoger datos del formulario
            const oFormData = {
                Id: oView.byId("Id").getValue(),
                TypeDocument: oView.byId("slTypeDocument").getSelectedKey(),
                NumberDocument: oView.byId("NumberDocument").getValue(),
                FirstName: oView.byId("FirstName").getValue(),
                LastName: oView.byId("LastName").getValue(),
                BirthDate: oView.byId("BirthDate").getValue(),
                PlaceBirth: oView.byId("slPlaceBirth").getSelectedKey(),
                Nationality: oView.byId("slNationality").getSelectedKey(),
                Genre: oView.byId("slGenre").getSelectedKey(),
                CivilStatus: oView.byId("slCivilStatus").getSelectedKey(),
                Country: oView.byId("slCountry").getSelectedKey(),
                Province: oView.byId("slProvince").getSelectedKey(),
                Region: oView.byId("slRegion").getSelectedKey(),
                Address: oView.byId("Address").getValue(),
                PostalCode: oView.byId("PostalCode").getValue(),
                PhoneNumber: oView.byId("PhoneNumber").getValue(),
                Email: oView.byId("PhoneEmail").getValue()
            };
            
            // Validar campos obligatorios
            if (!this._validateForm(oFormData)) {
                return;
            }
            
            // Obtener texto descriptivo para los campos de selección
            const sTypeDocumentText = this._getSelectedText("slTypeDocument");
            const sGenreText = this._getSelectedText("slGenre");
            const sCivilStatusText = this._getSelectedText("slCivilStatus");
            
            // Crear nuevo usuario para la tabla
            const oNewUser = {
                NumberDocument: oFormData.NumberDocument + " " + oFormData.TypeDocument,
                FullName: oFormData.FirstName + " " + oFormData.LastName,
                BirthDate: this._formatDate(oFormData.BirthDate),
                PlaceBirth: oFormData.PlaceBirth,
                Nationality: oFormData.Nationality,
                Genre: sGenreText,
                CivilStatus: sCivilStatusText
            };
            
            // Agregar a la lista de usuarios
            const aUsers = oSavedModel.getProperty("/users") || [];
            aUsers.unshift(oNewUser);
            
            // Actualizar modelos
            oFormModel.setProperty("/users", aUsers);
            oSavedModel.setProperty("/users", aUsers);
            
            // Guardar en archivo (simulado)
            this._saveToFile(oSavedModel.getJSON());
            
            MessageToast.show("Datos guardados correctamente");
        },
        
        onClear: function() {
            const oView = this.getView();
            
            // Limpiar todos los campos del formulario
            oView.byId("Id").setValue("");
            oView.byId("slTypeDocument").setSelectedKey("");
            oView.byId("NumberDocument").setValue("");
            oView.byId("FirstName").setValue("");
            oView.byId("LastName").setValue("");
            oView.byId("BirthDate").setValue("");
            oView.byId("slPlaceBirth").setSelectedKey("");
            oView.byId("slNationality").setSelectedKey("");
            oView.byId("slGenre").setSelectedKey("");
            oView.byId("slCivilStatus").setSelectedKey("");
            oView.byId("slCountry").setSelectedKey("");
            oView.byId("slProvince").setSelectedKey("");
            oView.byId("slRegion").setSelectedKey("");
            oView.byId("Address").setValue("");
            oView.byId("PostalCode").setValue("");
            oView.byId("PhoneNumber").setValue("");
            oView.byId("PhoneEmail").setValue("");
            
            MessageToast.show("Formulario limpiado");
        },
        
        _validateForm: function(oFormData) {
            // Validar campos obligatorios
            const aRequiredFields = [
                {field: "NumberDocument", name: "Número de Documento"},
                {field: "FirstName", name: "Nombre"},
                {field: "LastName", name: "Apellido"},
                {field: "BirthDate", name: "Fecha de Nacimiento"},
                {field: "TypeDocument", name: "Tipo de Documento"}
            ];
            
            for (const oField of aRequiredFields) {
                if (!oFormData[oField.field]) {
                    MessageToast.show(`El campo ${oField.name} es obligatorio`);
                    return false;
                }
            }
            return true;
        },
        
        _formatDate: function(sDate) {
            if (!sDate) return "";
            const oDate = new Date(sDate);
            return oDate.toLocaleDateString('es-ES'); // Formato dd/mm/yyyy
        },
        
        _getSelectedText: function(sSelectId) {
            const oSelect = this.getView().byId(sSelectId);
            return oSelect.getSelectedItem().getText();
        },
        
        _saveToFile: function(sData) {
            // Nota: En un entorno real necesitarías un backend para guardar archivos
            // Esto es solo una simulación para desarrollo local
            
            // Crear blob con los datos
            const oBlob = new Blob([sData], {type: "application/json"});
            
            // Crear enlace de descarga (simulación)
            const oLink = document.createElement("a");
            oLink.href = URL.createObjectURL(oBlob);
            oLink.download = "data.json";
            document.body.appendChild(oLink);
            oLink.click();
            document.body.removeChild(oLink);
            
            console.log("Datos preparados para guardar (en producción usar backend real)");
        }
    });
});