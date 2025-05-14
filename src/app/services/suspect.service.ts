import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { AuthService } from './auth.service';
import { Suspect } from '../models/suspect.model';

@Injectable({
  providedIn: 'root'
})
export class SuspectService {
  private configurations = inject(ConfigurationService);
  private authService = inject(AuthService);
  private apiUrl = `${this.configurations.baseUrl}/suspect`;

  constructor(private http: HttpClient) {}

  private get userName(): string {
    return this.authService.currentUser?.userName ?? '';
  }

  addSuspect(suspect: Suspect): Observable<any> {
    const formData = this.prepareFormData(suspect);  // No need for `true/false` flag
    return this.http.post(`${this.apiUrl}/`, formData);
  }
  
  updateSuspect(id: number, suspect: Suspect): Observable<Suspect> {
    const formData = this.prepareFormData(suspect);
    return this.http.put<Suspect>(`${this.apiUrl}/${id}`, formData);
  }

  getSuspects(): Observable<Suspect[]> {
    return this.http.get<any[]>(this.apiUrl + '/').pipe(
      map((response: any[]) =>
        response.map(item => this.mapToSuspectModel(item))
      )
    );
  }

  private mapToSuspectModel(item: any): Suspect {
    return {
      id: item.suspect_id,
      firstName: item.first_name,
      lastName: item.last_name,
      dateOfBirth: item.date_of_birth,
      gender: item.gender?.[0]?.toUpperCase() ?? 'U', // Convert "Male" -> "M"
      nationality: item.nationality,
      heightCm: item.height_cm,
      weightKg: item.weight_kg,
      shoulderWidthCm: item.shoulder_width_cm,
      torsoHeightCm: item.torso_height_cm,
      legLengthCm: item.leg_length_cm,
      shoeSize: item.shoe_size,
      hairColor: item.hair_color,
      eyeColor: item.eye_color,
      aliases: item.aliases,
      createdBy: item.created_by,
      modifiedBy: item.modified_by,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      // image is not part of the GET response — ignore here
      description: item.description, // You can adjust this if the backend starts returning a description
      isActive: true,  // Default value if not provided
      file_path : item.file_path,
      file_blob_base64 : item.file_blob_base64
    };
  }

  deleteSuspect(id: number): Observable<Suspect> {
    return this.http.delete<Suspect>(`${this.apiUrl}/${id}`);
  }
  prepareFormData(suspect: Suspect): FormData {
    const formData = new FormData();
  
    const safeAppend = (key: string, value: any) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    };
  
    // Basic info
    safeAppend('first_name', suspect.firstName);
    safeAppend('last_name', suspect.lastName);
    safeAppend('date_of_birth', suspect.dateOfBirth);
    safeAppend('gender', suspect.gender);
    safeAppend('nationality', suspect.nationality);
  
    // Anthropometric data
    safeAppend('height_cm', suspect.heightCm);
    safeAppend('weight_kg', suspect.weightKg);
    safeAppend('shoulder_width_cm', suspect.shoulderWidthCm);
    safeAppend('torso_height_cm', suspect.torsoHeightCm);
    safeAppend('leg_length_cm', suspect.legLengthCm);
    safeAppend('shoe_size', suspect.shoeSize);
  
    // Appearance
    safeAppend('hair_color', suspect.hairColor);
    safeAppend('eye_color', suspect.eyeColor);
    safeAppend('aliases', suspect.aliases);
  
    // Biometric fields
    safeAppend('face_embedding', (suspect as any).faceEmbedding);
    safeAppend('fingerprint_template', (suspect as any).fingerprintTemplate);
    safeAppend('iris_code', (suspect as any).irisCode);
    safeAppend('gait_signature', (suspect as any).gaitSignature);
  
    // Metadata
    safeAppend('created_by', suspect.createdBy);
    safeAppend('modified_by', suspect.modifiedBy);
        safeAppend('description', suspect.description);
  
    // Image file
    if (suspect.image instanceof File) {
      formData.append('image', suspect.image, suspect.image.name);
    }
  
    return formData;
  }
  
}
