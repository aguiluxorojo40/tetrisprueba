package pkg; // Reemplaza 'pkg' con tu nombre de paquete real

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.io.FileOutputStream;
import java.io.IOException;

public class MainActivity extends Activity {

    private static final int PERMISSION_REQUEST_CODE = 1;
    private EditText editTextQuestion;
    private Button buttonSave;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        editTextQuestion = findViewById(R.id.editTextQuestion);
        buttonSave = findViewById(R.id.buttonSave);

        buttonSave.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (checkAndRequestPermissions()) {
                    saveQuestion();
                }
            }
        });
    }

    private boolean checkAndRequestPermissions() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, PERMISSION_REQUEST_CODE);
            return false;
        }
        return true;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                saveQuestion();
            } else {
                Toast.makeText(this, "El permiso de almacenamiento es necesario para guardar las preguntas.", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void saveQuestion() {
        String questionText = editTextQuestion.getText().toString();
        if (!questionText.isEmpty()) {
            try (FileOutputStream fos = openFileOutput("questions.txt", MODE_APPEND)) {
                fos.write((questionText + "\n").getBytes());
                Toast.makeText(this, "Pregunta guardada.", Toast.LENGTH_SHORT).show();
                editTextQuestion.setText(""); // Limpia el campo de texto
            } catch (IOException e) {
                e.printStackTrace();
                Toast.makeText(this, "Error al guardar la pregunta.", Toast.LENGTH_SHORT).show();
            }
        } else {
            Toast.makeText(this, "Por favor, escribe una pregunta.", Toast.LENGTH_SHORT).show();
        }
    }
}
